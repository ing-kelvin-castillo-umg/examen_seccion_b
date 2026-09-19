import { proxyRequest } from "@/lib/server/backend-proxy";

export async function GET(request: Request) {
  return proxyRequest(request, "/api/auth/me");
}
