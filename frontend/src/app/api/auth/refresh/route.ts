import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://backend:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch(
      `${BACKEND_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
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
    console.error("[BFF] Error renovando token:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible renovar la sesión",
        data: null,
      },
      { status: 502 }
    );
  }
}
