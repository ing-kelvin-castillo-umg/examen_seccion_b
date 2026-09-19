import { NextRequest, NextResponse } from "next/server";

/**
 * URL interna del backend Spring Boot.
 * Es una variable de entorno de SERVIDOR (sin prefijo NEXT_PUBLIC_), por lo que
 * nunca se incluye en el bundle del navegador: el cliente solo conoce las rutas
 * locales de Next.js (/api/...) y es este proxy quien habla con el backend.
 */
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");

/** Encabezados de la petición del navegador que sí se reenvían al backend. */
const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type", "accept", "accept-language"];

/** Encabezados de la respuesta del backend que se devuelven al navegador. */
const FORWARDED_RESPONSE_HEADERS = ["content-type", "cache-control", "content-disposition", "www-authenticate"];

/** Métodos que no llevan cuerpo. */
const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

/**
 * Reenvía la petición entrante hacia `${BACKEND_URL}${targetPath}` conservando
 * método, query string, cuerpo y encabezados relevantes, y devuelve la respuesta
 * del backend (status + cuerpo) tal cual al cliente.
 */
export async function proxyToBackend(request: NextRequest, targetPath: string): Promise<NextResponse> {
  const url = new URL(request.url);
  const target = `${BACKEND_URL}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}${url.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Encabezados X-Forwarded-* para que el backend conozca el host público
  // (springdoc los usa para generar la URL del servidor en la documentación).
  // Se toman de los headers y no de request.url porque en modo standalone
  // Next.js construye request.url con el HOSTNAME de escucha (0.0.0.0).
  headers.set("x-forwarded-host", request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host);
  headers.set("x-forwarded-proto", request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", ""));
  const clientIp = request.headers.get("x-forwarded-for") ?? request.ip;
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  let body: ArrayBuffer | undefined;
  if (!BODYLESS_METHODS.has(request.method)) {
    const raw = await request.arrayBuffer();
    if (raw.byteLength > 0) body = raw;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error: any) {
    console.error(`[BFF PROXY] ${request.method} ${target} -> backend no disponible:`, error?.message);
    return NextResponse.json(
      { success: false, message: "El servicio no está disponible en este momento. Intente más tarde.", data: null },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  // Si el backend redirige a sí mismo, se reescribe la ubicación a una ruta
  // relativa para que el navegador siga pasando por el proxy.
  const location = upstream.headers.get("location");
  if (location) {
    responseHeaders.set("location", location.startsWith(BACKEND_URL) ? location.slice(BACKEND_URL.length) : location);
  }

  // Se devuelve el cuerpo ya decodificado; no se copian content-encoding /
  // content-length porque fetch ya descomprimió la respuesta.
  const responseBody = upstream.status === 204 || upstream.status === 304 ? null : await upstream.arrayBuffer();

  return new NextResponse(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
