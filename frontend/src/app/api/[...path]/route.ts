import { NextRequest, NextResponse } from "next/server";

/**
 * BFF / Proxy inverso hacia el backend Spring Boot.
 * El navegador solo conoce rutas locales (/api/...); esta ruta reenvía
 * la petición al backend real usando una variable de entorno del servidor
 * (nunca expuesta al cliente vía NEXT_PUBLIC_*).
 */
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH"]);

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const targetUrl = `${BACKEND_URL}/api/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);
  headers.set("accept", "application/json");

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (METHODS_WITH_BODY.has(request.method)) {
    init.body = await request.text();
  }

  try {
    const backendResponse = await fetch(targetUrl, init);
    const responseBody = await backendResponse.text();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "content-type": backendResponse.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[BFF ERROR] ${request.method} ${targetUrl}:`, error);
    return NextResponse.json(
      { success: false, message: "No se pudo conectar con el servicio backend", data: null },
      { status: 502 }
    );
  }
}

interface RouteContext {
  params: { path: string[] };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  return proxy(request, params.path);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  return proxy(request, params.path);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return proxy(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return proxy(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxy(request, params.path);
}
