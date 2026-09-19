import { clearSession, readSession } from "./session.store";

const PENDING = "umg.pendingLogout";
let sending: Promise<void> | null = null;
export async function retryLogout(): Promise<void> {
  if (sending) return sending;
  const body = sessionStorage.getItem(PENDING);
  if (!body) return;
  sending = (async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST", headers: { "Content-Type": "application/json" }, body,
        keepalive: true, signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Logout pendiente");
      if (sessionStorage.getItem(PENDING) === body) sessionStorage.removeItem(PENDING);
      console.info("[AUTH] Logout confirmado: sesión invalidada en el backend.");
    } finally { sending = null; }
  })();
  return sending;
}
export function closeSession(reason: "manual" | "inactivity") {
  const session = readSession();
  if (session) {
    // A signed access token identifies the entire session, even after refresh rotation.
    sessionStorage.setItem(PENDING, JSON.stringify({ token: session.token, reason }));
  }
  sessionStorage.setItem("umg.logoutReason", reason);
  localStorage.setItem("umg.logoutReason", reason);
  localStorage.removeItem("umg.lastActivity");
  clearSession();
  void retryLogout().catch(() => console.warn("[AUTH] Sin conexión: se reintentará el logout al recuperar la red."));
}
