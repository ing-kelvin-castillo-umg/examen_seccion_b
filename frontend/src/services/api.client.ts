import { ApiResponseDto, RefreshTokenResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static refreshPromise: Promise<string> | null = null;
  private static sessionGeneration = 0;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static clearSessionAndRedirect(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:session-expired"));

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  private static refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      const generationAtStart = this.sessionGeneration;
      this.refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
      })
        .then(async (response) => {
          const payload = (await response.json()) as ApiResponseDto<RefreshTokenResponseDto>;
          if (!response.ok || !payload.data?.token) {
            throw new Error(payload.message || "No fue posible renovar la sesión");
          }

          if (generationAtStart !== this.sessionGeneration) {
            throw new Error("La sesión se cerró durante la renovación");
          }

          localStorage.setItem("token", payload.data.token);
          window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: payload.data.token }));
          return payload.data.token;
        })
        .catch((error) => {
          if (generationAtStart === this.sessionGeneration) {
            this.clearSessionAndRedirect();
          }
          throw error;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, hasRetried = false): Promise<ApiResponseDto<T>> {
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
        credentials: "same-origin",
      });

      const data = await response.json();

      const isRefreshRequest = url === "/api/auth/refresh";
      const isLoginRequest = url === "/api/auth/login";
      const isLogoutRequest = url === "/api/auth/logout";
      if (response.status === 401 && !hasRetried && !isRefreshRequest && !isLoginRequest && !isLogoutRequest) {
        const refreshedToken = await this.refreshAccessToken();
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);
        return this.request<T>(url, { ...options, headers: retryHeaders }, true);
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

  static invalidateSession(): void {
    this.sessionGeneration += 1;
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
