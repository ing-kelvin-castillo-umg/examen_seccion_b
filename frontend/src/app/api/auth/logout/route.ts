import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/server/backend";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearAuthCookies } from "@/lib/server/cookies";

export const dynamic = "force-dynamic";

// Cierre de sesión centralizado (manual o por inactividad): el backend revoca los refresh tokens del usuario
// y el access token en curso (jti); después se limpian las cookies. Las cookies se limpian siempre.
export async function POST(req: NextRequest) {
  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  let revokedInBackend = false;

  if (access || refresh) {
    try {
      const upstream = await fetch(`${backendBaseUrl()}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: JSON.stringify({ refreshToken: refresh ?? null }),
        cache: "no-store",
      });
      revokedInBackend = upstream.ok;
    } catch {
      revokedInBackend = false;
    }
    console.info(
      revokedInBackend
        ? "[BFF] sesión cerrada: tokens revocados en el backend"
        : "[BFF] sesión cerrada localmente: el backend no confirmó la revocación"
    );
  }

  const res = NextResponse.json({ success: true, message: "Sesión cerrada", data: { revokedInBackend } });
  clearAuthCookies(res);
  return res;
}
