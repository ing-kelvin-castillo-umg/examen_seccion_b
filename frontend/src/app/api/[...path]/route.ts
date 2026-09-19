import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  filterResponseHeaders,
  forwardRequestHeaders,
} from "@/lib/server/backend";
import { ACCESS_COOKIE } from "@/lib/server/cookies";

export const dynamic = "force-dynamic";

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const target = buildBackendUrl(params.path, req.nextUrl.search);
  if (!target) {
    return NextResponse.json({ success: false, message: "Ruta inválida" }, { status: 400 });
  }

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: forwardRequestHeaders(req.headers, token),
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    const noBody = upstream.status === 204 || upstream.status === 304;
    return new NextResponse(noBody ? null : upstream.body, {
      status: upstream.status,
      headers: filterResponseHeaders(upstream.headers),
    });
  } catch {
    return NextResponse.json({ success: false, message: "Servicio no disponible" }, { status: 502 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
