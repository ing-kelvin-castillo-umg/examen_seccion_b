import { proxyRequest } from "@/lib/server/backend-proxy";

export async function POST(request: Request) {
  return proxyRequest(request, "/api/auth/refresh");
}
