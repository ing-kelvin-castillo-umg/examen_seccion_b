import { NextResponse } from "next/server";

/** Atajo equivalente al del backend: /swagger-ui.html -> /swagger-ui/index.html */
export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(null, { status: 302, headers: { location: "/swagger-ui/index.html" } });
}
