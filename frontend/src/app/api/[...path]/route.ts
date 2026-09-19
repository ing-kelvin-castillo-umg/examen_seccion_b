import { NextRequest, NextResponse } from "next/server";

// Nunca usar NEXT_PUBLIC_ aqui: esta variable solo debe existir en el servidor de Next.js,
// jamas en el bundle que se envia al navegador.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

async function forwardToBackend(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const backendPath = pathSegments.join("/");
  const targetUrl = `${BACKEND_URL}/api/${backendPath}${request.nextUrl.search}`;

  const forwardedHeaders = new Headers();
  const authorization = request.headers.get("authorization");
  if (authorization) {
    forwardedHeaders.set("authorization", authorization);
  }
  const contentType = request.headers.get("content-type");
  if (contentType) {
    forwardedHeaders.set("content-type", contentType);
  }
  forwardedHeaders.set("accept", "application/json");

  const isBodylessMethod = request.method === "GET" || request.method === "HEAD";
  const requestBody = isBodylessMethod ? undefined : await request.text();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardedHeaders,
      body: requestBody,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "No se pudo contactar al servicio backend", data: null },
      { status: 502 }
    );
  }

  const responseText = await backendResponse.text();
  return new NextResponse(responseText, {
    status: backendResponse.status,
    headers: {
      "content-type": backendResponse.headers.get("content-type") || "application/json",
    },
  });
}

type RouteParams = { params: { path: string[] } };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return forwardToBackend(request, params.path);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return forwardToBackend(request, params.path);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return forwardToBackend(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return forwardToBackend(request, params.path);
}
