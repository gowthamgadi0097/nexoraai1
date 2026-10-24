import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = getSession();
  if (!s) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { name: s.name, email: s.email } });
}
