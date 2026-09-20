import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8080";
const REFRESH_COOKIE_NAME = "refresh_token";
const REFRESH_COOKIE_MAX_AGE = Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS || "1800");
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
  const path = context.params.path;
  const backendUrl = buildBackendUrl(path, request);
  const isLogin = method === "POST" && path.join("/") === "auth/login";
  const isRefresh = method === "POST" && path.join("/") === "auth/refresh";
  const isLogout = method === "POST" && path.join("/") === "auth/logout";

  try {
    const refreshToken = isRefresh || isLogout
      ? request.cookies.get(REFRESH_COOKIE_NAME)?.value
      : undefined;
    if (isRefresh && !refreshToken) {
      return Response.json(
        { success: false, message: "No hay un refresh token disponible.", data: null },
        { status: 401, headers: { "Set-Cookie": serializeRefreshCookie("", request, 0) } }
      );
    }

    if (isLogout && !refreshToken) {
      return buildLogoutResponse(
        Response.json({ success: true, message: "Sesión cerrada correctamente", data: null }),
        request
      );
    }

    const backendResponse = await fetch(backendUrl, {
      method,
      headers: buildForwardHeaders(request),
      body: BODYLESS_METHODS.has(method)
        ? undefined
        : isRefresh || isLogout
          ? JSON.stringify({ refreshToken })
          : await request.arrayBuffer(),
      cache: "no-store",
    });

    if (isLogin || isRefresh) {
      return buildAuthResponse(backendResponse, request, isLogin, isRefresh);
    }

    if (isLogout) {
      return buildLogoutResponse(backendResponse, request);
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: buildResponseHeaders(backendResponse),
    });
  } catch (error) {
    console.error(`[BFF ERROR] ${method} ${backendUrl}:`, error);

    const headers = new Headers();
    if (isRefresh) headers.append("Set-Cookie", serializeRefreshCookie("", request, 0));
    if (isLogout) appendClearedRefreshCookies(headers, request);

    return Response.json(
      {
        success: false,
        message: "No se pudo conectar con el backend.",
        data: null,
      },
      { status: 502, headers }
    );
  }
}

function serializeRefreshCookie(
  value: string,
  request: NextRequest,
  maxAge: number,
  path = "/api/auth"
): string {
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const isHttps = forwardedProtocol === "https" || request.nextUrl.protocol === "https:";
  const parts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "SameSite=Strict",
    `Path=${path}`,
    `Max-Age=${maxAge}`,
  ];

  if (isHttps) parts.push("Secure");
  return parts.join("; ");
}

function appendClearedRefreshCookies(headers: Headers, request: NextRequest): void {
  headers.append("Set-Cookie", serializeRefreshCookie("", request, 0));
  headers.append("Set-Cookie", serializeRefreshCookie("", request, 0, "/api/auth/refresh"));
}

function buildLogoutResponse(backendResponse: Response, request: NextRequest): Response {
  const headers = buildResponseHeaders(backendResponse);
  appendClearedRefreshCookies(headers, request);

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers,
  });
}

async function buildAuthResponse(
  backendResponse: Response,
  request: NextRequest,
  isLogin: boolean,
  isRefresh: boolean
): Promise<Response> {
  const payload = await backendResponse.json();
  const headers = buildResponseHeaders(backendResponse);

  if (isLogin && backendResponse.ok && payload?.data?.refreshToken) {
    headers.set(
      "Set-Cookie",
      serializeRefreshCookie(payload.data.refreshToken, request, REFRESH_COOKIE_MAX_AGE)
    );
    delete payload.data.refreshToken;
  }

  if (isRefresh && !backendResponse.ok) {
    headers.set("Set-Cookie", serializeRefreshCookie("", request, 0));
  }

  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(payload), {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers,
  });
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
