import { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend-proxy";

export const dynamic = "force-dynamic";

interface ProductRouteContext {
  params: {
    id: string;
  };
}

function productPath(id: string): string {
  return `/api/products/${encodeURIComponent(id)}`;
}

export function GET(request: NextRequest, { params }: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(params.id));
}

export function PUT(request: NextRequest, { params }: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(params.id));
}

export function DELETE(request: NextRequest, { params }: ProductRouteContext): Promise<Response> {
  return proxyToBackend(request, productPath(params.id));
}
