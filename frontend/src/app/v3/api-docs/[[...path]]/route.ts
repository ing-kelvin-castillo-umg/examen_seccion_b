import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Proxy de la especificación OpenAPI (/v3/api-docs y /v3/api-docs/swagger-config). */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: NextRequest, { params }: { params: { path?: string[] } }) {
  const suffix = params.path?.length ? `/${params.path.join("/")}` : "";
  return proxyToBackend(request, `/v3/api-docs${suffix}`);
}
