import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

// El navegador solo conoce las rutas del BFF de Next.js. La URL real del backend
// vive exclusivamente en el servidor mediante BACKEND_URL.
const API_BASE_URL = "";

export class ApiClient {
  private static refreshPromise: Promise<boolean> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static isAuthEndpoint(endpoint: string): boolean {
    return endpoint.startsWith("/api/auth/");
  }

  private static async refreshAccessToken(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    if (!this.refreshPromise) {
      this.refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok || !data?.data?.token) {
            return false;
          }

          const session = data.data as AuthResponseDto;
          localStorage.setItem("token", session.token);
          localStorage.setItem("refreshToken", session.refreshToken);
          localStorage.setItem(
            "expiresAt",
            String(Date.now() + (session.expiresIn || 120) * 1000),
          );
          if (session.username) {
            const currentUser = JSON.parse(localStorage.getItem("user") || "null");
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...currentUser,
                username: session.username,
                fullName: session.fullName,
                email: session.email,
                roles: session.roles,
              }),
            );
          }

          console.info("[AUTH] access_token_refreshed", {
            expiresIn: session.expiresIn,
            via: "/api/auth/refresh",
          });
          window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: session }));
          return true;
        })
        .catch(() => false)
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<ApiResponseDto<T>> {
    const expiresAt = typeof window !== "undefined"
      ? Number(localStorage.getItem("expiresAt") || 0)
      : 0;

    if (!this.isAuthEndpoint(endpoint) && expiresAt > 0 && expiresAt <= Date.now() + 30_000) {
      await this.refreshAccessToken();
    }

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

      const rawData = await response.text();
      const data = rawData ? JSON.parse(rawData) : {};

      if (response.status === 401 && retry && !this.isAuthEndpoint(endpoint)) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, false);
        }
      }

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
