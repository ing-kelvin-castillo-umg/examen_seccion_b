import { NextRequest } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://backend:8080";
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "expect",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

type RouteContext = {
  params: { path: string[] };
};

function copyHeaders(source: Headers): Headers {
  const headers = new Headers();

  source.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
}

async function proxy(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const path = params.path.map(encodeURIComponent).join("/");
  const backendPath = path.startsWith("swagger-ui/") ? `/${path}` : `/api/${path}`;
  const targetUrl = new URL(`${backendPath}${request.nextUrl.search}`, BACKEND_API_URL);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: copyHeaders(request.headers),
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: copyHeaders(backendResponse.headers),
    });
  } catch (error) {
    console.error(`[BFF ERROR] ${request.method} ${targetUrl}:`, error);
    return Response.json(
      { success: false, message: "No fue posible contactar al servicio backend" },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
