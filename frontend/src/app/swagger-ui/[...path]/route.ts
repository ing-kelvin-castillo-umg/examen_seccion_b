import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Proxy de los recursos estáticos de Swagger UI (/swagger-ui/index.html, css, js). */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyToBackend(request, `/swagger-ui/${params.path.join("/")}`);
}
