import type { NextResponse } from "next/server";
import { jwtSecondsLeft } from "./session";
import type { SessionTokens } from "./session";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const DEFAULT_REFRESH_SECONDS = 7 * 24 * 3600;

function baseOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // Secure se controla por variable de entorno (false en localhost sin HTTPS)
    secure: process.env.COOKIE_SECURE === "true",
  };
}

/**
 * access_token: path "/" y vida = la del JWT (si la cookie desaparece, el proxy refresca solo).
 * refresh_token: path "/api" (solo viaja hacia las rutas BFF, nunca en navegación de páginas).
 */
export function setSessionCookies(res: NextResponse, tokens: SessionTokens): void {
  const left = jwtSecondsLeft(tokens.accessToken);
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(),
    path: "/",
    maxAge: left !== null ? Math.max(left, 1) : 3600,
  });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(),
    path: "/api",
    maxAge: tokens.refreshExpiresIn && tokens.refreshExpiresIn > 0 ? tokens.refreshExpiresIn : DEFAULT_REFRESH_SECONDS,
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE, "", { ...baseOptions(), path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...baseOptions(), path: "/api", maxAge: 0 });
}
