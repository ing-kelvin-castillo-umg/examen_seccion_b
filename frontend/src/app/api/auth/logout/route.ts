import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/server/cookies";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Sesión cerrada", data: null });
  clearAuthCookies(res);
  return res;
}
