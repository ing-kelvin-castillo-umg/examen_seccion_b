import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8080";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "expect",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

type RouteContext = {
  params: {
    path: string[];
  };
};

function createRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));

  return headers;
}

function createResponseHeaders(headers: Headers): Headers {
  const responseHeaders = new Headers(headers);

  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));

  return responseHeaders;
}

async function proxy(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const backendBaseUrl = BACKEND_URL.replace(/\/$/, "");
  const isDocsRequest = params.path[0] === "docs";
  const pathSegments = isDocsRequest ? params.path.slice(1) : params.path;
  const backendPath = pathSegments.map(encodeURIComponent).join("/");
  const backendPrefix = isDocsRequest ? "" : "/api";
  const targetUrl = `${backendBaseUrl}${backendPrefix}/${backendPath}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: createRequestHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    const shouldRewriteDocsConfig =
      isDocsRequest &&
      (backendPath.endsWith("swagger-initializer.js") || backendPath.endsWith("swagger-config"));

    if (shouldRewriteDocsConfig) {
      const body = (await backendResponse.text())
        .replaceAll("/v3/api-docs", "/api/docs/v3/api-docs")
        .replace(/https?:\/\/[^"']+\/swagger-ui/g, "/api/docs/swagger-ui");

      return new Response(body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: createResponseHeaders(backendResponse.headers),
      });
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: createResponseHeaders(backendResponse.headers),
    });
  } catch (error) {
    console.error(`[BFF ERROR] ${request.method} ${targetUrl}:`, error);

    return Response.json(
      { success: false, message: "No fue posible conectar con el backend" },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
