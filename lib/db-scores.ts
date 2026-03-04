import prisma from "./prisma";

export interface DbScore {
  id: number;
  userEmail: string | null;
  userName: string;
  wpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalChars: number;
  durationSeconds?: number;
  paragraphId?: number;
  paragraphTitle?: string | null;
  paragraphText?: string | null;
  typedText?: string | null;
  createdAt: Date;
}

export async function addScore(
  input: {
    wpm: number;
    accuracy: number;
    correctChars: number;
    wrongChars: number;
    totalChars: number;
    durationSeconds?: number;
    paragraphId?: number;
    paragraphTitle?: string;
    paragraphText?: string;
    typedText?: string;
  },
  userEmail: string,
  userName: string
): Promise<DbScore> {
  const score = await prisma.score.create({
    data: {
      userEmail,
      userName: userName || userEmail,
      wpm: input.wpm,
      accuracy: input.accuracy,
      correctChars: input.correctChars,
      wrongChars: input.wrongChars,
      totalChars: input.totalChars,
      durationSeconds: input.durationSeconds ?? null,
      paragraphId: input.paragraphId ?? null,
      paragraphTitle: input.paragraphTitle ?? null,
      paragraphText: input.paragraphText ?? null,
      typedText: input.typedText ?? null,
    },
  });

  return {
    id: score.id,
    userEmail: score.userEmail,
    userName: score.userName,
    wpm: score.wpm,
    accuracy: score.accuracy,
    correctChars: score.correctChars,
    wrongChars: score.wrongChars,
    totalChars: score.totalChars,
    durationSeconds: score.durationSeconds ?? undefined,
    paragraphId: score.paragraphId ?? undefined,
    paragraphTitle: score.paragraphTitle ?? undefined,
    paragraphText: score.paragraphText ?? undefined,
    typedText: score.typedText ?? undefined,
    createdAt: score.createdAt,
  };
}

export async function getLeaderboard(
  limit = 50,
  filter: "all" | "today" | "weekly" = "all"
): Promise<DbScore[]> {
  const now = new Date();
  let startDate: Date | null = null;
  if (filter === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === "weekly") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
  }

  const where =
    startDate != null
      ? {
          createdAt: {
            gte: startDate,
          },
        }
      : {};

  const scores = await prisma.score.groupBy({
    by: ["userEmail"],
    where,
    _max: {
      wpm: true,
      createdAt: true,
    },
  });

  // Fetch full rows for each userEmail + best wpm + createdAt
  const detailed = await Promise.all(
    scores
      .sort((a, b) => {
        const wpmA = a._max.wpm ?? 0;
        const wpmB = b._max.wpm ?? 0;
        if (wpmA !== wpmB) return wpmB - wpmA;
        const dateA = a._max.createdAt?.getTime() ?? 0;
        const dateB = b._max.createdAt?.getTime() ?? 0;
        return dateB - dateA;
      })
      .slice(0, limit)
      .map(async (g) => {
        const best = await prisma.score.findFirst({
          where: {
            userEmail: g.userEmail,
            wpm: g._max.wpm ?? undefined,
            createdAt: g._max.createdAt ?? undefined,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!best) return null;

        return {
          id: best.id,
          userEmail: best.userEmail,
          userName: best.userName,
          wpm: best.wpm,
          accuracy: best.accuracy,
          correctChars: best.correctChars,
          wrongChars: best.wrongChars,
          totalChars: best.totalChars,
          durationSeconds: best.durationSeconds ?? undefined,
          createdAt: best.createdAt,
        } as DbScore;
      })
  );

  return detailed.filter((s): s is DbScore => s !== null);
}

export async function getScoresByUserEmail(userEmail: string): Promise<DbScore[]> {
  const scores = await prisma.score.findMany({
    where: { userEmail },
    orderBy: { createdAt: "desc" },
  });
  return scores.map((s) => ({
    id: s.id,
    userEmail: s.userEmail,
    userName: s.userName,
    wpm: s.wpm,
    accuracy: s.accuracy,
    correctChars: s.correctChars,
    wrongChars: s.wrongChars,
    totalChars: s.totalChars,
    durationSeconds: s.durationSeconds ?? undefined,
    paragraphId: s.paragraphId ?? undefined,
    paragraphTitle: s.paragraphTitle ?? undefined,
    paragraphText: s.paragraphText ?? undefined,
    typedText: s.typedText ?? undefined,
    createdAt: s.createdAt,
  }));
}
