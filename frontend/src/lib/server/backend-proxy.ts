import { NextResponse } from "next/server";

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || "http://backend:8080";

export async function proxyRequest(request: Request, path: string) {
  try {
    const url = new URL(request.url);
    const backendUrl = `${BACKEND_INTERNAL_URL}${path}${url.search}`;
    
    const headers = new Headers();
    headers.set("Accept", "application/json");
    
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    } else {
      headers.set("Content-Type", "application/json");
    }
    
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const init: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const text = await request.text();
      if (text) {
        init.body = text;
      }
    }

    const response = await fetch(backendUrl, init);
    const responseText = await response.text();
    
    let bodyData = null;
    if (responseText) {
      try {
        bodyData = JSON.parse(responseText);
      } catch {
        // Fallback to raw response if not JSON
        const rawHeaders = new Headers();
        const resContentType = response.headers.get("content-type");
        if (resContentType) {
            rawHeaders.set("Content-Type", resContentType);
        }
        return new Response(responseText, { status: response.status, headers: rawHeaders });
      }
    }

    // Retorna NextResponse.json o Response(null)
    if (bodyData === null) {
        return new Response(null, { status: response.status });
    }
    
    return NextResponse.json(bodyData, { status: response.status });
  } catch (error) {
    console.error("[BFF Proxy Error]", error);
    return NextResponse.json(
      { message: "No se pudo comunicar con el servicio backend" },
      { status: 502 }
    );
  }
}
