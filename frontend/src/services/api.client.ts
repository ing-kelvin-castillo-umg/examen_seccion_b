import { ApiResponseDto } from "@/dtos/auth.dto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiClient {
  private static refreshPromise: Promise<string> | null = null;

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  private static clearSessionAndRedirect() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }

  private static async doRefresh(refreshToken: string): Promise<string> {
    const refreshUrl = `${API_BASE_URL}/api/auth/refresh`;
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const resData = await response.json();
    if (!resData.success || !resData.data || !resData.data.token) {
      throw new Error("Invalid refresh response");
    }

    const newToken = resData.data.token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
      if (resData.data.refreshToken) {
        localStorage.setItem("refreshToken", resData.data.refreshToken);
      }
    }
    return newToken;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, _isRetry = false): Promise<ApiResponseDto<T>> {
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

      if (!response.ok) {
        if (
          response.status === 401 &&
          !endpoint.includes("/api/auth/login") &&
          !endpoint.includes("/api/auth/refresh") &&
          !_isRetry
        ) {
          const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
          
          if (!refreshToken) {
            ApiClient.clearSessionAndRedirect();
            throw new Error("No refresh token available");
          }

          if (!ApiClient.refreshPromise) {
            ApiClient.refreshPromise = ApiClient.doRefresh(refreshToken).finally(() => {
              ApiClient.refreshPromise = null;
            });
          }

          try {
            await ApiClient.refreshPromise;
            // Retry request with new token
            return await ApiClient.request<T>(endpoint, options, true);
          } catch (refreshError) {
            ApiClient.clearSessionAndRedirect();
            throw refreshError;
          }
        }

        const data = await response.json().catch(() => ({}));
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
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
