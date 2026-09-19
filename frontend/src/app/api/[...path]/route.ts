import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8080";
const BODYLESS_METHODS = new Set(["GET", "HEAD"]);
const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type", "accept"];
const EXCLUDED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
]);

type RouteContext = {
  params: {
    path: string[];
  };
};

function buildBackendUrl(path: string[], request: NextRequest): string {
  const baseUrl = BACKEND_URL.endsWith("/") ? BACKEND_URL : `${BACKEND_URL}/`;
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const backendUrl = new URL(`api/${encodedPath}`, baseUrl);
  backendUrl.search = request.nextUrl.search;

  return backendUrl.toString();
}

function buildForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  FORWARDED_REQUEST_HEADERS.forEach((headerName) => {
    const headerValue = request.headers.get(headerName);

    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  });

  return headers;
}

function buildResponseHeaders(response: Response): Headers {
  const headers = new Headers();

  response.headers.forEach((value, key) => {
    if (!EXCLUDED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<Response> {
  const method = request.method.toUpperCase();
  const backendUrl = buildBackendUrl(context.params.path, request);

  try {
    const backendResponse = await fetch(backendUrl, {
      method,
      headers: buildForwardHeaders(request),
      body: BODYLESS_METHODS.has(method) ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: buildResponseHeaders(backendResponse),
    });
  } catch (error) {
    console.error(`[BFF ERROR] ${method} ${backendUrl}:`, error);

    return Response.json(
      {
        success: false,
        message: "No se pudo conectar con el backend.",
        data: null,
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}
