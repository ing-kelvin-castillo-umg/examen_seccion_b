import { NextRequest, NextResponse } from "next/server";

// URL base interna del backend de Spring Boot (accesible desde el servidor Next.js)
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

interface RouteContext {
  params: Promise<{ path: string[] }> | { path: string[] };
}

/**
 * Proxy inverso (BFF - Backend For Frontend) que reenvía peticiones desde el cliente
 * hacia el backend de Spring Boot, ocultando la URL y puerto interno del backend.
 */
async function proxyRequest(request: NextRequest, context: RouteContext) {
  const resolvedParams = await Promise.resolve(context.params);
  const pathArray = resolvedParams.path || [];
  const targetPath = pathArray.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/api/${targetPath}${search}`;

  // Reenviar encabezados relevantes, excluyendo los de transporte que gestiona fetch
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey !== "host" &&
      lowerKey !== "connection" &&
      lowerKey !== "content-length"
    ) {
      forwardHeaders.set(key, value);
    }
  });

  const method = request.method;
  let body: BodyInit | null = null;

  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("text/")) {
      body = await request.text();
    } else {
      const buffer = await request.arrayBuffer();
      if (buffer.byteLength > 0) {
        body = buffer;
      }
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
    });

    // Reenviar encabezados de respuesta del backend hacia el cliente
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "content-encoding" &&
        lowerKey !== "transfer-encoding" &&
        lowerKey !== "connection"
      ) {
        responseHeaders.set(key, value);
      }
    });

    const responseData = await backendResponse.arrayBuffer();

    return new NextResponse(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[BFF PROXY ERROR] Error al comunicar con backend en ${targetUrl}:`, error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Error de comunicación con el backend interno a través de la pasarela BFF",
        error: error.message,
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
