import { ApiResponseDto } from "@/dtos/auth.dto";

// Las peticiones del navegador siempre van al propio origen de Next.js (rutas /api/...),
// que actua como pasarela/BFF hacia el backend. El navegador nunca conoce la URL real del backend.
const API_BASE_URL = "";

export class ApiClient {
  // Evita disparar varias renovaciones simultaneas cuando varias peticiones fallan con 401 a la vez
  private static refreshPromise: Promise<string | null> | null = null;

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

  private static storeTokens(token: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  private static clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  private static redirectToLogin(): void {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json();
        const newToken = payload?.data?.token;
        const newRefreshToken = payload?.data?.refreshToken;
        if (!newToken || !newRefreshToken) return null;
        this.storeTokens(newToken, newRefreshToken);
        return newToken as string;
      })
      .catch(() => null)
      .finally(() => {
        this.refreshPromise = null;
      });

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

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (error: any) {
      console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, error.message);
      throw error;
    }

    const isAuthEndpoint = endpoint.startsWith("/api/auth/login") || endpoint.startsWith("/api/auth/refresh");

    // El token de acceso expiro: se intenta renovar de forma transparente y se reintenta la petición una sola vez
    if (response.status === 401 && !isRetry && !isAuthEndpoint) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        return this.request<T>(endpoint, options, true);
      }
      this.clearSession();
      this.redirectToLogin();
      throw new Error("Sesión expirada, por favor inicia sesión de nuevo");
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
      console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, errorMsg);
      throw new Error(errorMsg);
    }

    return data as ApiResponseDto<T>;
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
