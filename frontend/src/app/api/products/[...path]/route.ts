import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8080";

type RouteContext = {
  params: {
    path: string[];
  };
};

async function proxy(request: NextRequest, context: RouteContext) {
  try {
    const path = context.params.path.join("/");
    const search = request.nextUrl.search;
    const authorization = request.headers.get("authorization");

    const response = await fetch(
      `${BACKEND_URL}/api/products/${path}${search}`,
      {
        method: request.method,
        headers: {
          "Content-Type":
            request.headers.get("content-type") || "application/json",
          Accept: "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body:
          request.method === "GET" || request.method === "HEAD"
            ? undefined
            : await request.text(),
        cache: "no-store",
      }
    );

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[BFF] Error en detalle de producto:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible conectar con el servicio de productos",
        data: null,
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const PUT = proxy;
export const DELETE = proxy;
