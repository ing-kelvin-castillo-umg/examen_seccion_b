import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";
import { getJwtExpirationMs } from "@/lib/jwt";

/** Eventos globales de sesión que emite el TokenManager (los escucha AuthContext). */
export const AUTH_EVENTS = {
  TOKEN_REFRESHED: "auth:token-refreshed",
  SESSION_EXPIRED: "auth:session-expired",
} as const;

export type SessionExpiredReason = "session_expired" | "refresh_failed";

const STORAGE_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  TOKEN_EXPIRES_AT: "tokenExpiresAt",
  USER: "user",
} as const;

/** Margen (ms) antes de la expiración a partir del cual el access token se renueva proactivamente. */
const REFRESH_THRESHOLD_MS = 30_000;

/**
 * Administra el ciclo de vida de los tokens en el cliente:
 *  - Persistencia de access/refresh token en localStorage.
 *  - Detección de expiración próxima del access token.
 *  - Renovación transparente contra /api/auth/refresh (a través del proxy BFF),
 *    garantizando una sola petición de refresh en vuelo (single-flight).
 *  - Notificación de renovación o de sesión expirada mediante eventos del navegador.
 */
export class TokenManager {
  private static refreshInFlight: Promise<string | null> | null = null;

  private static get storage(): Storage | null {
    return typeof window !== "undefined" ? window.localStorage : null;
  }

  // ---------- Persistencia ----------

  static saveTokens(dto: Pick<AuthResponseDto, "token" | "refreshToken" | "expiresIn">): void {
    const s = this.storage;
    if (!s) return;
    s.setItem(STORAGE_KEYS.TOKEN, dto.token);
    if (dto.refreshToken) s.setItem(STORAGE_KEYS.REFRESH_TOKEN, dto.refreshToken);
    const expiresAt = getJwtExpirationMs(dto.token) ?? (dto.expiresIn ? Date.now() + dto.expiresIn : null);
    if (expiresAt) s.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(expiresAt));
  }

  static saveUser(user: unknown): void {
    this.storage?.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getAccessToken(): string | null {
    return this.storage?.getItem(STORAGE_KEYS.TOKEN) ?? null;
  }

  static getRefreshToken(): string | null {
    return this.storage?.getItem(STORAGE_KEYS.REFRESH_TOKEN) ?? null;
  }

  static getStoredUser<T>(): T | null {
    const raw = this.storage?.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  static getAccessTokenExpiresAt(): number | null {
    const raw = this.storage?.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    if (raw) return Number(raw);
    const token = this.getAccessToken();
    return token ? getJwtExpirationMs(token) : null;
  }

  static clear(): void {
    const s = this.storage;
    if (!s) return;
    Object.values(STORAGE_KEYS).forEach((key) => s.removeItem(key));
  }

  // ---------- Estado del access token ----------

  /** Milisegundos restantes de vigencia del access token (0 si ya expiró o no existe). */
  static getRemainingMs(): number {
    const expiresAt = this.getAccessTokenExpiresAt();
    return expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  }

  static isAccessTokenExpired(): boolean {
    return !!this.getAccessToken() && this.getRemainingMs() === 0;
  }

  /** true si el token expiró o expira dentro del margen configurado. */
  static isAccessTokenExpiringSoon(): boolean {
    return !!this.getAccessToken() && this.getRemainingMs() <= REFRESH_THRESHOLD_MS;
  }

  // ---------- Renovación ----------

  /**
   * Solicita un nuevo access token usando el refresh token almacenado.
   * Devuelve el nuevo access token, o null si no fue posible renovarlo (en ese
   * caso la sesión local se limpia y se emite SESSION_EXPIRED).
   * Si ya hay una renovación en curso, todas las llamadas comparten esa promesa.
   */
  static refreshAccessToken(): Promise<string | null> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.doRefresh().finally(() => {
        this.refreshInFlight = null;
      });
    }
    return this.refreshInFlight;
  }

  private static async doRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.expireSession("session_expired");
      return null;
    }

    console.info("[AUTH] Access token expirado o próximo a expirar → solicitando renovación a /api/auth/refresh…");

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const payload = (await response.json().catch(() => null)) as ApiResponseDto<AuthResponseDto> | null;

      if (!response.ok || !payload?.data?.token) {
        console.warn(`[AUTH] Renovación rechazada (HTTP ${response.status}): ${payload?.message ?? "sin detalle"}`);
        this.expireSession("refresh_failed");
        return null;
      }

      this.saveTokens(payload.data);
      const expiresAt = this.getAccessTokenExpiresAt();
      console.info(
        `[AUTH] Token renovado correctamente. Nueva expiración: ${expiresAt ? new Date(expiresAt).toLocaleTimeString() : "?"}`
      );
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, { detail: { token: payload.data.token } }));
      return payload.data.token;
    } catch (error: any) {
      // Error de red: no se cierra la sesión, se reintentará en la siguiente petición.
      console.error("[AUTH] Error de red al renovar el token:", error?.message);
      return null;
    }
  }

  /** Limpia la sesión local y notifica a la aplicación para redirigir al login. */
  static expireSession(reason: SessionExpiredReason): void {
    this.clear();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED, { detail: { reason } }));
    }
  }
}
