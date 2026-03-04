import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error(
      "[API health] DB unreachable:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { status: "error", db: "disconnected" },
      { status: 200 }
    );
  }
}
