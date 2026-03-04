import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { addScore } from "@/lib/db-scores";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const wpm = Number(body.wpm) || 0;
    const accuracy = Number(body.accuracy) || 0;
    const correctChars = Number(body.correctChars) || 0;
    const wrongChars = Number(body.wrongChars) || 0;
    const totalChars = Number(body.totalChars) || 0;
    const durationSeconds = body.durationSeconds != null ? Number(body.durationSeconds) : undefined;
    const paragraphId = body.paragraphId != null ? Number(body.paragraphId) : undefined;
    const paragraphTitle = typeof body.paragraphTitle === "string" ? body.paragraphTitle : undefined;
    const paragraphText = typeof body.paragraphText === "string" ? body.paragraphText : undefined;
    const typedText = typeof body.typedText === "string" ? body.typedText : undefined;

    const score = await addScore(
      {
        wpm,
        accuracy,
        correctChars,
        wrongChars,
        totalChars,
        durationSeconds,
        paragraphId,
        paragraphTitle,
        paragraphText,
        typedText,
      },
      session.user.email,
      session.user.name ?? session.user.email
    );
    return NextResponse.json({
      id: score.id.toString(),
      wpm: score.wpm,
      accuracy: score.accuracy,
      createdAt: score.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[API scores POST]", err);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}
