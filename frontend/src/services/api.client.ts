import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = "";

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

  private static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      console.log("[AUTH] Renovando access token...");

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("No fue posible renovar la sesión");
      }

      const data =
        (await response.json()) as ApiResponseDto<AuthResponseDto>;

      localStorage.setItem("token", data.data.token);

      if (data.data.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          data.data.refreshToken
        );
      }

      console.log("[AUTH] Access token renovado correctamente");

      return data.data.token;
    } catch (error) {
      console.error("[AUTH] Refresh token inválido o expirado");

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return null;
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponseDto<T>> {

    const url =
      `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (
      response.status === 401 &&
      retry &&
      endpoint !== "/api/auth/login" &&
      endpoint !== "/api/auth/refresh"
    ) {
      const newToken = await this.refreshAccessToken();

      if (newToken) {
        return this.request<T>(
          endpoint,
          options,
          false
        );
      }
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data?.message ||
        `Error HTTP ${response.status}: ${response.statusText}`;

      throw new Error(errorMsg);
    }

    return data as ApiResponseDto<T>;
  }

  static get<T>(
    endpoint: string
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(
      endpoint,
      { method: "GET" }
    );
  }

  static post<T>(
    endpoint: string,
    body: any
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  }

  static put<T>(
    endpoint: string,
    body: any
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  }

  static delete<T>(
    endpoint: string
  ): Promise<ApiResponseDto<T>> {
    return this.request<T>(
      endpoint,
      { method: "DELETE" }
    );
  }
}
