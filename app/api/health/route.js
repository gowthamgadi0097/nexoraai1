import { NextResponse } from "next/server";
import { connectDB, dbErrorMessage } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Render health check + quick way to confirm MongoDB is reachable.
export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (e) {
    return NextResponse.json({ ok: false, db: "unreachable", reason: dbErrorMessage(e) }, { status: 503 });
  }
}
