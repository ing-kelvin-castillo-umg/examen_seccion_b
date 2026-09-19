import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/server/backend";
import { setSessionCookies } from "@/lib/server/cookies";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let upstream: Response;
  try {
    upstream = await fetch(`${backendBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: await req.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ success: false, message: "Servicio no disponible" }, { status: 502 });
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body?.data?.token || !body?.data?.refreshToken) {
    return NextResponse.json(body ?? { success: false, message: "Error de autenticación" }, {
      status: upstream.ok ? 502 : upstream.status,
    });
  }

  // Los tokens viajan solo en cookies httpOnly; al navegador solo le llegan los datos del usuario.
  const { token, refreshToken, refreshExpiresIn, expiresIn: _expiresIn, type: _type, ...user } = body.data;
  const res = NextResponse.json({ ...body, data: user });
  setSessionCookies(res, { accessToken: token, refreshToken, refreshExpiresIn });
  return res;
}
