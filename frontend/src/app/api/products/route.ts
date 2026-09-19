import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Propaga el querystring tal cual (por ejemplo "?query=laptop") al backend.
  return proxyToBackend(request, `/api/products${request.nextUrl.search}`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/products");
}
