/**
 * Utilidades mínimas para leer el payload de un JWT en el navegador.
 * NO valida la firma (eso lo hace el backend); solo sirve para conocer la
 * fecha de expiración y decidir cuándo renovar el token de forma proactiva.
 */
export interface JwtPayload {
  sub?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof window === "undefined" ? Buffer.from(base64, "base64").toString("utf8") : atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Fecha de expiración del token en milisegundos epoch, o null si no se puede leer. */
export function getJwtExpirationMs(token: string): number | null {
  const payload = decodeJwt(token);
  return payload?.exp ? payload.exp * 1000 : null;
}
