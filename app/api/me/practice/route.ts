import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getScoresByUserEmail } from "@/lib/db-scores";

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const scores = await getScoresByUserEmail(session.user.email);
    return NextResponse.json(
      scores.map((s) => ({
        id: s.id,
        wpm: s.wpm,
        rawWpm: s.rawWpm,
        consistency: s.consistency,
        accuracy: s.accuracy,
        correctChars: s.correctChars,
        wrongChars: s.wrongChars,
        totalChars: s.totalChars,
        durationSeconds: s.durationSeconds,
        paragraphId: s.paragraphId,
        paragraphTitle: s.paragraphTitle,
        paragraphText: s.paragraphText,
        typedText: s.typedText,
        createdAt: s.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("[API me/practice GET]", err);
    return NextResponse.json(
      { error: "Failed to load practice history" },
      { status: 500 }
    );
  }
}
