import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * Pasarela (BFF) para la API REST del backend.
 *
 * Cualquier petición a /api/** que reciba Next.js (por ejemplo /api/auth/login
 * o /api/products/3) se reenvía al mismo path del backend Spring Boot. Así el
 * navegador solo conoce el origen de Next.js y la URL real del backend queda
 * oculta dentro de la red interna.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: { path: string[] } };

function handler(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, `/api/${params.path.join("/")}`);
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
