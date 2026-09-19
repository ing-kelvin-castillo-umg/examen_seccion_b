import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

// Todas las peticiones se dirigen al BFF de Next.js (mismo origen).
// El navegador nunca conoce la URL real del backend Spring Boot.
const AUTH_ENDPOINTS_WITHOUT_RETRY = ["/api/auth/login", "/api/auth/refresh"];

export class ApiClient {
  // Evita disparar múltiples refresh en paralelo cuando varias peticiones
  // reciben 401 al mismo tiempo (single-flight).
  private static refreshingPromise: Promise<string | null> | null = null;

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

  private static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const payload = (await response.json()) as ApiResponseDto<AuthResponseDto>;
      const newToken = payload?.data?.token;
      const newRefreshToken = payload?.data?.refreshToken;
      if (!newToken || !newRefreshToken) return null;

      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return newToken;
    } catch {
      return null;
    }
  }

  private static clearSessionAndRedirect(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?reason=session_expired";
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponseDto<T>> {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
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

      const isAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_RETRY.some((authUrl) => url.startsWith(authUrl));

      // Access token expirado o inválido: se intenta renovar una sola vez de forma
      // transparente y se reintenta la petición original antes de desconectar al usuario.
      if (response.status === 401 && !isRetry && !isAuthEndpoint) {
        if (!this.refreshingPromise) {
          this.refreshingPromise = this.refreshAccessToken().finally(() => {
            this.refreshingPromise = null;
          });
        }

        const newToken = await this.refreshingPromise;

        if (newToken) {
          return this.request<T>(endpoint, options, true);
        }

        this.clearSessionAndRedirect();
        throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
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
