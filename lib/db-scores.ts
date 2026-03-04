import prisma from "./prisma";

export interface DbScore {
  id: number;
  userEmail: string;
  userName: string;
  wpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalChars: number;
  durationSeconds?: number;
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
