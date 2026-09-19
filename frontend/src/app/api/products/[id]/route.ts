import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, `/api/products/${params.id}`);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, `/api/products/${params.id}`);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxyToBackend(request, `/api/products/${params.id}`);
}
