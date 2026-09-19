import { createHash } from "crypto";
import { backendBaseUrl } from "./backend";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresIn?: number;
}

export interface RefreshResult {
  tokens: SessionTokens | null;
  /** true si falló por indisponibilidad del backend (no por token inválido): no se debe cerrar la sesión. */
  transient: boolean;
}

/** Segundos que le quedan al JWT (sin verificar firma: eso lo hace el backend). null si no se puede leer. */
export function jwtSecondsLeft(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.exp === "number" ? Math.floor(payload.exp - Date.now() / 1000) : null;
  } catch {
    return null;
  }
}

/** true si el token no se puede leer o vence en menos de `skewSeconds`. */
export function isExpiring(token: string, skewSeconds = 10): boolean {
  const left = jwtSecondsLeft(token);
  return left === null || left <= skewSeconds;
}

// Single-flight: peticiones concurrentes con el mismo refresh token comparten UNA sola llamada al backend.
// El resultado se conserva unos segundos para las peticiones que ya iban en vuelo con las cookies viejas
// (si no, reusarían un refresh token ya rotado y el backend lo trataría como robo).
const GRACE_MS = 30_000;
type Flights = Map<string, Promise<RefreshResult>>;
const globalStore = globalThis as unknown as { __bffRefreshFlights?: Flights };
const flights: Flights = (globalStore.__bffRefreshFlights ??= new Map());

async function callBackendRefresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${backendBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return { tokens: null, transient: res.status >= 500 };

    const data = (await res.json().catch(() => null))?.data;
    if (!data?.token || !data?.refreshToken) return { tokens: null, transient: false };

    console.info("[BFF] token refrescado");
    return {
      tokens: {
        accessToken: data.token,
        refreshToken: data.refreshToken,
        refreshExpiresIn: data.refreshExpiresIn,
      },
      transient: false,
    };
  } catch {
    return { tokens: null, transient: true };
  }
}

export function refreshSession(refreshToken: string): Promise<RefreshResult> {
  const key = createHash("sha256").update(refreshToken).digest("hex");
  const existing = flights.get(key);
  if (existing) return existing;

  const flight = callBackendRefresh(refreshToken);
  flights.set(key, flight);
  flight.then((result) => {
    // Fallo transitorio: no cachear, el siguiente intento debe volver a llamar al backend.
    setTimeout(() => flights.delete(key), result.transient ? 0 : GRACE_MS).unref?.();
  });
  return flight;
}
