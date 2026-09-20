import type { ApiResponseDto, RefreshTokenResponseDto } from "@/dtos/auth.dto";

export const ACCESS_TOKEN_REFRESHED_EVENT = "auth:access-token-refreshed";

export class ApiClient {
  private static refreshPromise: Promise<string> | null = null;

  private static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  private static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  private static buildHeaders(options: RequestInit, accessToken: string | null): Headers {
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (!headers.has("Accept")) headers.set("Accept", "application/json");

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      headers.delete("Authorization");
    }

    return headers;
  }

  private static canAttemptRefresh(endpoint: string, accessToken: string | null): boolean {
    const path = endpoint.split("?", 1)[0];
    return !!accessToken && path !== "/api/auth/login" && path !== "/api/auth/refresh";
  }

  private static async performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No existe un refresh token para renovar la sesión.");
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiResponseDto<RefreshTokenResponseDto>;
    if (!response.ok || !payload.data?.accessToken) {
      throw new Error(payload.message || "No fue posible renovar la sesión.");
    }

    localStorage.setItem("accessToken", payload.data.accessToken);
    window.dispatchEvent(
      new CustomEvent<string>(ACCESS_TOKEN_REFRESHED_EVENT, {
        detail: payload.data.accessToken,
      }),
    );

    return payload.data.accessToken;
  }

  private static getRefreshedAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh()
        .catch((error) => {
          this.clearSessionAndRedirect();
          throw error;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  private static clearSessionAndRedirect(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    hasRetried = false,
    accessTokenOverride?: string,
  ): Promise<ApiResponseDto<T>> {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const accessToken = accessTokenOverride ?? this.getAccessToken();
    const headers = this.buildHeaders(options, accessToken);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (
        response.status === 401 &&
        !hasRetried &&
        this.canAttemptRefresh(endpoint, accessToken)
      ) {
        if (!this.getRefreshToken()) {
          this.clearSessionAndRedirect();
        } else {
          const storedAccessToken = this.getAccessToken();
          const newAccessToken =
            storedAccessToken && storedAccessToken !== accessToken
              ? storedAccessToken
              : await this.getRefreshedAccessToken();

          return this.request<T>(endpoint, options, true, newAccessToken);
        }
      }

      const data = (await response.json()) as ApiResponseDto<T>;

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error(`[API ERROR] ${options.method || "GET"} ${url}:`, message);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: unknown): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
