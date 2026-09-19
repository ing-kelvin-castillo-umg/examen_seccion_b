import { NextRequest, NextResponse } from "next/server";

/**
 * URL real del backend de Spring Boot. Se lee ÚNICAMENTE en el servidor de Next.js
 * (Route Handlers), nunca en el navegador:
 * - En Docker Compose, el contenedor "frontend" recibe BACKEND_URL=http://backend:8080
 *   (nombre del servicio en la red interna de Docker, no "localhost").
 * - En desarrollo local sin Docker (npm run dev), cae al valor por defecto localhost:8080.
 * Al NO tener el prefijo NEXT_PUBLIC_, Next.js jamás la incluye en el bundle del cliente.
 */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

// Cabeceras "hop-by-hop" o que podrían filtrar detalles de la infraestructura interna:
// no se reenvían tal cual desde la respuesta del backend hacia el navegador.
const STRIPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
  "server",
  "x-powered-by",
]);

/**
 * Reenvía una petición ya recibida por un Route Handler de Next.js hacia el backend
 * de Spring Boot, y devuelve al navegador el status code y el body del backend tal
 * cual, sin alterarlos. Si el backend no responde (caído / red), devuelve un JSON
 * de error 502 en vez de dejar que la excepción se propague.
 *
 * @param request Petición original recibida por el Route Handler.
 * @param backendPath Ruta (+ querystring si aplica) a invocar en el backend,
 *   por ejemplo "/api/products?query=foo".
 */
export async function proxyToBackend(request: NextRequest, backendPath: string): Promise<NextResponse> {
  const targetUrl = `${BACKEND_URL}${backendPath}`;

  const forwardHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  const authHeader = request.headers.get("authorization");
  if (authHeader) forwardHeaders["Authorization"] = authHeader;
  const contentType = request.headers.get("content-type");
  if (contentType) forwardHeaders["Content-Type"] = contentType;

  const methodMayHaveBody = !["GET", "HEAD"].includes(request.method);
  const body = methodMayHaveBody ? await request.text() : undefined;

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: body ? body : undefined,
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[BFF] No se pudo contactar al backend en ${targetUrl}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "El servicio no está disponible en este momento. Intenta de nuevo en unos segundos.",
      },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  backendResponse.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const responseBody = await backendResponse.arrayBuffer();

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}
