import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db-scores";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const filterParam = searchParams.get("filter");
  const filter =
    filterParam === "today" || filterParam === "weekly"
      ? filterParam
      : "all";
  try {
    const scores = await getLeaderboard(limit, filter);
    return NextResponse.json(
      scores.map((s) => ({
        id: s._id?.toString(),
        userEmail: s.userEmail,
        userName: s.userName,
        wpm: s.wpm,
        accuracy: s.accuracy,
        correctChars: s.correctChars,
        wrongChars: s.wrongChars,
        totalChars: s.totalChars,
        durationSeconds: s.durationSeconds,
        createdAt: s.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("[API leaderboard]", err);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 503 }
    );
  }
}
