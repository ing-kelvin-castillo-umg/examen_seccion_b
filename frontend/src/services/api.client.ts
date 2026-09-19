import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

// BFF (Fase 1): el navegador ya no conoce la URL real del backend. Todas las
// peticiones van a rutas relativas de Next.js (src/app/api/...), que son las
// que reenvían internamente hacia Spring Boot desde el servidor.
const API_BASE_URL = "";

// Endpoints del propio flujo de autenticación: el interceptor de 401 nunca
// debe intentar refrescar el token para ellos (evita bucles infinitos).
const AUTH_FLOW_ENDPOINTS = new Set(["/api/auth/login", "/api/auth/refresh"]);

export class ApiClient {
  // Promesa de refresh compartida entre peticiones concurrentes (Fase 2): si
  // varias llamadas reciben 401 al mismo tiempo, solo se dispara UNA petición
  // de refresh y todas esperan el mismo resultado, en vez de disparar una
  // "tormenta" de refrescos en paralelo.
  private static refreshPromise: Promise<boolean> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  private static setTokens(token: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  private static clearSessionAndRedirectToLogin(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }

  /**
   * Pide un access token nuevo usando el refresh token guardado. Devuelve
   * true si lo consiguió (y ya dejó el nuevo token+refreshToken en
   * localStorage) o false si el refresh no es válido (expirado/revocado/sin
   * refresh token guardado) o falló por red.
   */
  private static async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;

        try {
          const response = await this.request<AuthResponseDto>("/api/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
          });

          const newToken = response.data?.token;
          const newRefreshToken = response.data?.refreshToken;
          if (!newToken || !newRefreshToken) return false;

          this.setTokens(newToken, newRefreshToken);
          return true;
        } catch {
          return false;
        }
      })().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<ApiResponseDto<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Interceptor de 401 (Fase 2): el access token expiró o es inválido.
      // Se intenta refrescar de forma transparente y, si funciona, se
      // reintenta la petición original UNA sola vez con el token nuevo. No
      // aplica a /api/auth/login ni /api/auth/refresh (evita recursión), ni
      // a un reintento que ya falló (evita bucles si el token nuevo también
      // fuera rechazado).
      if (response.status === 401 && !AUTH_FLOW_ENDPOINTS.has(endpoint) && !isRetry) {
        const refreshed = await this.refreshAccessToken();

        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }

        this.clearSessionAndRedirectToLogin();
        throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data as ApiResponseDto<T>;
    } catch (error: any) {
      console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, error.message);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
