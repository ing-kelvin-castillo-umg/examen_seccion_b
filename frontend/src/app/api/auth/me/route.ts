import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend-proxy";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest): Promise<Response> {
  return proxyToBackend(request, "/api/auth/me");
}
