import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

// Cada refresh debe llegar siempre al backend, nunca servirse de caché.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/auth/refresh");
}
