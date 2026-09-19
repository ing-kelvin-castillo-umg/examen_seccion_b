import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/server/backend";
import { setAccessCookie } from "@/lib/server/cookies";

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
  if (!upstream.ok || !body?.data?.token) {
    return NextResponse.json(body ?? { success: false, message: "Error de autenticación" }, {
      status: upstream.ok ? 502 : upstream.status,
    });
  }

  // El token viaja solo en cookie httpOnly; al navegador solo le llegan los datos del usuario.
  const { token, type: _type, ...user } = body.data;
  const res = NextResponse.json({ ...body, data: user });
  setAccessCookie(res, token);
  return res;
}
