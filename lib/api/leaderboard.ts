export interface LeaderboardEntry {
  id: string;
  userEmail: string;
  userName: string;
  wpm: number;
  rawWpm: number;
  consistency: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalChars: number;
  durationSeconds?: number;
  createdAt: string;
}

export async function fetchLeaderboardApi(
  limit = 50,
  filter: "all" | "today" | "weekly" = "all"
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (filter !== "all") params.set("filter", filter);
  const res = await fetch(
    `/api/leaderboard?${params.toString()}`,
    { credentials: "include" }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to load leaderboard"
    );
  }
  return res.json();
}

export async function saveScoreApi(score: {
  wpm: number;
  rawWpm: number;
  consistency: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalChars: number;
  durationSeconds?: number;
  paragraphId?: number;
  paragraphTitle?: string;
  paragraphText?: string;
  typedText?: string;
}): Promise<{
  id: string;
  wpm: number;
  rawWpm: number;
  consistency: number;
  accuracy: number;
  createdAt: string;
}> {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(score),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to save score"
    );
  }
  return res.json();
}

export interface PracticeEntry {
  id: number;
  wpm: number;
  rawWpm: number;
  consistency: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalChars: number;
  durationSeconds?: number;
  paragraphId?: number;
  paragraphTitle?: string | null;
  paragraphText?: string | null;
  typedText?: string | null;
  createdAt: string;
}

export async function fetchMyPracticeApi(): Promise<PracticeEntry[]> {
  const res = await fetch("/api/me/practice", { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) return [];
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to load practice history"
    );
  }
  return res.json();
}
