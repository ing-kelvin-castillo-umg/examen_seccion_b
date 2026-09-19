import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

// Depende del header Authorization de cada usuario: nunca debe cachearse ni
// compartirse entre peticiones de distintos usuarios.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/auth/me");
}
