import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = (process.env.BACKEND_API_URL || "http://backend:8080").replace(/\/+$/, "");

const REQUEST_HEADERS_TO_FORWARD = ["accept", "authorization", "content-type"] as const;
const RESPONSE_HEADERS_TO_EXCLUDE = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
]);

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<Response> {
  const backendUrl = new URL(backendPath, `${BACKEND_API_URL}/`);
  backendUrl.search = request.nextUrl.search;

  const headers = new Headers();
  for (const headerName of REQUEST_HEADERS_TO_FORWARD) {
    const value = request.headers.get(headerName);
    if (value) headers.set(headerName, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, name) => {
      if (!RESPONSE_HEADERS_TO_EXCLUDE.has(name.toLowerCase())) {
        responseHeaders.set(name, value);
      }
    });

    const responseCannotHaveBody = [204, 205, 304].includes(backendResponse.status);

    return new Response(responseCannotHaveBody ? null : backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[BFF ERROR] ${request.method} ${backendPath}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "No fue posible comunicarse con el servicio de backend.",
        data: null,
      },
      { status: 502 },
    );
  }
}
