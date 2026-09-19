import { proxyRequest } from "@/lib/server/backend-proxy";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return proxyRequest(request, `/api/products/${params.id}`);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return proxyRequest(request, `/api/products/${params.id}`);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return proxyRequest(request, `/api/products/${params.id}`);
}
