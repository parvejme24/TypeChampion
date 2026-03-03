import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("[API health] DB unreachable:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { status: "error", db: "disconnected" },
      { status: 200 }
    );
  }
}
