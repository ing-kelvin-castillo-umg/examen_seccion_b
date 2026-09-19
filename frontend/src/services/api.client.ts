import { ApiResponseDto } from "@/dtos/auth.dto";
// En el cliente, las peticiones apuntan a la ruta relativa ("") para pasar por el BFF de Next.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Control de concurrencia para la renovación de tokens
let isRefreshingPromise: Promise<string> | null = null;

export class ApiClient {
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

  /**
   * Petición directa sin interceptor (para evitar bucles en login y refresh)
   */
  static async rawRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data as ApiResponseDto<T>;
  }

  /**
   * Renueva el token de acceso de forma concurrente y segura
   */
  private static async executeRefreshToken(): Promise<string> {
    if (isRefreshingPromise) {
      return isRefreshingPromise;
    }

    isRefreshingPromise = (async () => {
      try {
        const storedRefreshToken = this.getRefreshToken();
        if (!storedRefreshToken) {
          throw new Error("No hay refresh token disponible");
        }

        const response = await this.rawRequest<{ token: string; refreshToken?: string }>("/api/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        const newToken = response.data?.token;
        if (!newToken) {
          throw new Error("Respuesta de refresh no devolvió un nuevo token");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("token", newToken);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
        }

        return newToken;
      } catch (err) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          if (!window.location.pathname.startsWith("/login") && window.location.pathname !== "/") {
            window.location.href = "/login?session=expired";
          }
        }
        throw err;
      } finally {
        isRefreshingPromise = null;
      }
    })();

    return isRefreshingPromise;
  }

  /**
   * Petición principal con interceptor de renovación transparente en caso de 401
   */
  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const isAuthEndpoint = endpoint.includes("/api/auth/login") || endpoint.includes("/api/auth/refresh");

    if (isAuthEndpoint) {
      return this.rawRequest<T>(endpoint, options);
    }

    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    let token = this.getToken();

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

      // Si el access token expiró (401), intentar renovación transparente
      if (response.status === 401) {
        console.warn(`[API] Token expirado en ${endpoint}. Iniciando renovación transparente...`);
        try {
          const newToken = await this.executeRefreshToken();
          headers["Authorization"] = `Bearer ${newToken}`;

          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });

          const retryData = await retryResponse.json();
          if (!retryResponse.ok) {
            throw new Error(retryData?.message || `Error HTTP ${retryResponse.status}`);
          }
          return retryData as ApiResponseDto<T>;
        } catch (refreshErr: any) {
          console.error("[API] La renovación automática falló:", refreshErr.message);
          throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
        }
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

