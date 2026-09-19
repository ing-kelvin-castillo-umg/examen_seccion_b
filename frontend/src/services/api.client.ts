import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";
import { readSession, saveSession, clearSession, expiresSoon } from "./session.store";

export class ApiClient {
  private static refreshing: Promise<void> | null = null;

  static async refresh(force = false, rejectedToken?: string): Promise<void> {
    if (this.refreshing) return this.refreshing;
    const renew = async () => {
      const current = readSession();
      if (!current) return;
      if (rejectedToken && current.token !== rejectedToken) return;
      if (!force && !expiresSoon(current.token)) return;
      const response = await fetch("/api/auth/refresh", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
        cache: "no-store", signal: AbortSignal.timeout(15000),
      });
      // An in-flight refresh must not restore a session that was closed or replaced.
      if (readSession()?.refreshToken !== current.refreshToken) return;
      if (response.status === 401) {
        clearSession();
        window.location.assign("/login?reason=expired");
        throw new Error("Sesión expirada. Inicia sesión de nuevo.");
      }
      if (!response.ok) throw new Error("No se pudo renovar la sesión. Inténtalo de nuevo.");
      const data: ApiResponseDto<AuthResponseDto> = await response.json();
      if (readSession()?.refreshToken === current.refreshToken) {
        saveSession(data.data);
        console.info("[AUTH] Refresh exitoso: nuevo token JWT recibido.");
      }
    };
    // Share a lock between tabs so a rotated refresh token is only used once.
    this.refreshing = (async () => {
      if (navigator.locks) await navigator.locks.request("umg-auth", renew);
      else await renew();
    })().finally(() => { this.refreshing = null; });
    return this.refreshing;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const url = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
    const login = url === "/api/auth/login";
    if (!login && readSession()) await this.refresh();
    const send = () => {
      const headers = new Headers(options.headers);
      headers.set("Content-Type", "application/json"); headers.set("Accept", "application/json");
      const token = readSession()?.token;
      if (!login && token) headers.set("Authorization", "Bearer " + token);
      return fetch(url, { ...options, headers, cache: "no-store" });
    };
    const usedToken = readSession()?.token;
    let response = await send();
    if (!login && response.status === 401 && readSession()) {
      await this.refresh(true, usedToken);
      response = await send(); // Retry only once; never refresh on 403.
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Error HTTP " + response.status);
    return data;
  }
  static get<T>(endpoint: string) { return this.request<T>(endpoint, { method: "GET" }); }
  static post<T>(endpoint: string, body: unknown) { return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }); }
  static put<T>(endpoint: string, body: unknown) { return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }); }
  static delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: "DELETE" }); }
}
