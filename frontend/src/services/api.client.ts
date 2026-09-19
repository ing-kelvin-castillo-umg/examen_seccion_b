import { ApiResponseDto } from "@/dtos/auth.dto";
import { TokenManager } from "./token.manager";

/**
 * Todas las peticiones se dirigen a rutas locales de Next.js (mismo origen).
 * Los Route Handlers en src/app/api/[...path] actúan como proxy inverso (BFF)
 * y reenvían la petición al backend; el navegador nunca conoce su URL real.
 */
const API_BASE_URL = "";

/** Endpoints que nunca deben disparar una renovación de token. */
const AUTH_ENDPOINTS = ["/api/auth/login", "/api/auth/refresh"];

export interface ApiRequestOptions extends RequestInit {
  /** Desactiva la política de refresh token para esta petición. */
  skipAuthRefresh?: boolean;
}

export class ApiClient {
  private static buildHeaders(options: RequestInit, token: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  /**
   * Política de refresh token:
   *  1. Proactiva: si el access token está por expirar, se renueva ANTES de llamar al backend.
   *  2. Reactiva: si el backend responde 401, se renueva y se reintenta la petición una sola vez.
   *  3. Si la renovación falla, TokenManager limpia la sesión y emite el evento de sesión expirada
   *     (AuthContext redirige al login).
   */
  static async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponseDto<T>> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${path}`;
    const { skipAuthRefresh, ...fetchOptions } = options;
    const refreshAllowed = !skipAuthRefresh && !AUTH_ENDPOINTS.some((p) => path.startsWith(p));

    let token = TokenManager.getAccessToken();

    // 1) Renovación proactiva
    if (refreshAllowed && token && TokenManager.isAccessTokenExpiringSoon() && TokenManager.getRefreshToken()) {
      token = (await TokenManager.refreshAccessToken()) ?? TokenManager.getAccessToken();
    }

    try {
      let response = await fetch(url, { ...fetchOptions, headers: this.buildHeaders(fetchOptions, token) });

      // 2) Renovación reactiva ante 401 y reintento único
      if (response.status === 401 && refreshAllowed && token && TokenManager.getRefreshToken()) {
        console.warn(`[AUTH] 401 en ${fetchOptions.method || "GET"} ${path} → intentando renovar el token…`);
        const newToken = await TokenManager.refreshAccessToken();
        if (newToken) {
          response = await fetch(url, { ...fetchOptions, headers: this.buildHeaders(fetchOptions, newToken) });
        }
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data as ApiResponseDto<T>;
    } catch (error: any) {
      console.error(`[API ERROR] ${fetchOptions.method || "GET"} ${url}:`, error.message);
      throw error;
    }
  }

  static get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  static post<T>(endpoint: string, body: any, options?: ApiRequestOptions): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) });
  }

  static put<T>(endpoint: string, body: any, options?: ApiRequestOptions): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) });
  }

  static delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}
