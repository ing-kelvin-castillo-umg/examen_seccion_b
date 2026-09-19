/**
 * Motivo por el que se envió al usuario a la pantalla de login (sesión
 * expirada, inactividad...). Se guarda en sessionStorage además de viajar en la
 * URL, para que el mensaje no se pierda si ocurre otra redirección a /login.
 */
const KEY = "sessionNotice";

export type SessionNoticeReason = "inactivity" | "session_expired" | "refresh_failed";

export function setSessionNotice(reason: SessionNoticeReason): void {
  try {
    window.sessionStorage.setItem(KEY, reason);
  } catch {
    /* ignorar */
  }
}

/** Devuelve el motivo pendiente (si existe) y lo elimina. */
export function consumeSessionNotice(): string | null {
  try {
    const value = window.sessionStorage.getItem(KEY);
    if (value) window.sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
