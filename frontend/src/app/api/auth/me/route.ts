import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8080";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[BFF] Error obteniendo usuario:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible conectar con el servicio de usuarios",
        data: null,
      },
      { status: 502 }
    );
  }
}
