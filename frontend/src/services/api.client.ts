import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

export class ApiClient {
  private static refreshPromise: Promise<string> | null = null;
  private static logoutPromise: Promise<void> | null = null;
  private static logoutInProgress = false;

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

  private static canRefresh(endpoint: string): boolean {
    return (
      endpoint !== "/api/auth/login" &&
      endpoint !== "/api/auth/refresh" &&
      endpoint !== "/api/auth/logout"
    );
  }

  private static clearExpiredSession(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:session-expired"));

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  private static async performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("La sesión no tiene un refresh token válido");
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (await response.json()) as ApiResponseDto<AuthResponseDto>;

    if (!response.ok || !payload.success || !payload.data?.token || !payload.data?.refreshToken) {
      throw new Error(payload.message || "No fue posible renovar la sesión");
    }

    localStorage.setItem("token", payload.data.token);
    localStorage.setItem("refreshToken", payload.data.refreshToken);
    window.dispatchEvent(
      new CustomEvent("auth:token-refreshed", { detail: { token: payload.data.token } }),
    );

    return payload.data.token;
  }

  private static refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private static async performLogout(): Promise<void> {
    if (this.refreshPromise) {
      try {
        await this.refreshPromise;
      } catch {
        return;
      }
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return;

    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ApiResponseDto<unknown> | null;
      throw new Error(payload?.message || "No fue posible invalidar la sesión en el backend");
    }
  }

  static revokeSession(): Promise<void> {
    if (!this.logoutPromise) {
      this.logoutInProgress = true;
      this.logoutPromise = this.performLogout().finally(() => {
        this.logoutPromise = null;
        this.logoutInProgress = false;
      });
    }

    return this.logoutPromise;
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    allowRefresh = true,
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

      if (response.status === 401 && this.canRefresh(endpoint) && !this.logoutInProgress) {
        if (allowRefresh && this.getRefreshToken()) {
          try {
            await this.refreshAccessToken();
            return this.request<T>(endpoint, options, false);
          } catch (refreshError) {
            this.clearExpiredSession();
            throw refreshError;
          }
        }

        this.clearExpiredSession();
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
