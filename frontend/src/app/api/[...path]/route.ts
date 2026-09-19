import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  filterResponseHeaders,
  forwardRequestHeaders,
} from "@/lib/server/backend";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearAuthCookies, setSessionCookies } from "@/lib/server/cookies";
import { isExpiring, refreshSession } from "@/lib/server/session";
import type { SessionTokens } from "@/lib/server/session";

export const dynamic = "force-dynamic";

const unavailable = () =>
  NextResponse.json({ success: false, message: "Servicio no disponible" }, { status: 502 });

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const target = buildBackendUrl(params.path, req.nextUrl.search);
  if (!target) {
    return NextResponse.json({ success: false, message: "Ruta inválida" }, { status: 400 });
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  // El body se lee una sola vez para poder reintentar la petición tras refrescar el token.
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const send = (accessToken?: string) =>
    fetch(target, {
      method: req.method,
      headers: forwardRequestHeaders(req.headers, accessToken),
      body,
      redirect: "manual",
      cache: "no-store",
    });

  let access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  let renewed = null as SessionTokens | null;
  let sessionLost = false;

  try {
    // 1) Antes de enviar: sin cookie de acceso o a punto de vencer -> refrescar (no dependemos de que exista).
    if (refresh && (!access || isExpiring(access))) {
      const result = await refreshSession(refresh);
      if (result.tokens) {
        renewed = result.tokens;
        access = result.tokens.accessToken;
      } else if (result.transient) {
        return unavailable();
      } else {
        sessionLost = true;
        access = undefined;
      }
    }

    let upstream = await send(access);

    // 2) Si el backend responde 401 con sesión aparentemente válida -> UN refresh y UN reintento.
    if (upstream.status === 401 && refresh && !renewed && !sessionLost) {
      const result = await refreshSession(refresh);
      if (result.tokens) {
        renewed = result.tokens;
        upstream = await send(result.tokens.accessToken);
      } else if (result.transient) {
        return unavailable();
      } else {
        sessionLost = true;
      }
    }

    const noBody = upstream.status === 204 || upstream.status === 304;
    const res = new NextResponse(noBody ? null : upstream.body, {
      status: upstream.status,
      headers: filterResponseHeaders(upstream.headers),
    });

    if (renewed) setSessionCookies(res, renewed);
    // Refresh fallido (expirado/revocado): se limpian las cookies; el 401 llega al cliente y este va a /login.
    if (sessionLost) clearAuthCookies(res);
    return res;
  } catch {
    return unavailable();
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
