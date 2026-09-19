import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE, clearAuthCookies, setSessionCookies } from "@/lib/server/cookies";
import { refreshSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

// Renovación explícita de la sesión (el proxy también la hace solo, de forma transparente).
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    const res = NextResponse.json({ success: false, message: "Sesión expirada" }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const { tokens, transient } = await refreshSession(refreshToken);

  if (!tokens) {
    if (transient) {
      return NextResponse.json({ success: false, message: "Servicio no disponible" }, { status: 502 });
    }
    const res = NextResponse.json({ success: false, message: "Sesión expirada" }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const res = NextResponse.json({ success: true, message: "Sesión renovada", data: null });
  setSessionCookies(res, tokens);
  return res;
}
