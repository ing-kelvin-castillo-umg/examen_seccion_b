import { AuthResponseDto } from "@/dtos/auth.dto";
import { AuthMapper } from "@/mappers/auth.mapper";

export const SESSION_KEY = "umg.session";
export const SESSION_EVENT = "umg:session";
export function readSession(): AuthResponseDto | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
export function saveSession(data: AuthResponseDto) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  // Keep compatibility with the original session representation.
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(AuthMapper.toSession(data).user));
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("token"); localStorage.removeItem("user");
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function expiresSoon(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp * 1000 - Date.now() <= 10000;
  } catch { return true; }
}
