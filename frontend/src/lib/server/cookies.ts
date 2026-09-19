import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = "access_token";

function secureFlag(): boolean {
  return process.env.COOKIE_SECURE === "true";
}

/** Lee el `exp` del JWT (sin verificar: la verificación la hace el backend). */
function maxAgeFromJwt(token: string, fallbackSeconds = 3600): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    const seconds = Math.floor(payload.exp - Date.now() / 1000);
    return seconds > 0 ? seconds : fallbackSeconds;
  } catch {
    return fallbackSeconds;
  }
}

export function setAccessCookie(res: NextResponse, token: string): void {
  res.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureFlag(),
    path: "/",
    maxAge: maxAgeFromJwt(token),
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secureFlag(),
    path: "/",
    maxAge: 0,
  });
}
