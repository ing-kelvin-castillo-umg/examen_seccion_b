import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://backend:8080";

export async function POST(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      `${BACKEND_URL}/api/auth/logout`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(authorization
            ? { Authorization: authorization }
            : {}),
        },
        cache: "no-store",
      }
    );

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json",
      },
    });
  } catch (error) {
    console.error("[BFF] Error cerrando sesión:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible notificar el cierre de sesión",
        data: null,
      },
      { status: 502 }
    );
  }
}
