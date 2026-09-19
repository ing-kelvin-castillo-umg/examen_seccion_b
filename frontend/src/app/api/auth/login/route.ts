import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

// Nunca cachear: cada login debe llegar siempre al backend.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/auth/login");
}
