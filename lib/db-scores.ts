import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

const SCORES_COLLECTION = "scores";

export interface DbScore {
  _id?: ObjectId;
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
  const db = await getDb();
  const col = db.collection<DbScore>(SCORES_COLLECTION);
  const doc: DbScore = {
    userEmail,
    userName: userName || userEmail,
    wpm: input.wpm,
    accuracy: input.accuracy,
    correctChars: input.correctChars,
    wrongChars: input.wrongChars,
    totalChars: input.totalChars,
    durationSeconds: input.durationSeconds,
    createdAt: new Date(),
  };
  await col.insertOne(doc);
  return doc;
}

export async function getLeaderboard(
  limit = 50,
  filter: "all" | "today" | "weekly" = "all"
): Promise<DbScore[]> {
  const db = await getDb();
  const col = db.collection<DbScore>(SCORES_COLLECTION);

  const now = new Date();
  let startDate: Date | null = null;
  if (filter === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === "weekly") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
  }

  const matchStage =
    startDate != null ? { $match: { createdAt: { $gte: startDate } } } : null;

  const pipeline: object[] = [
    ...(matchStage ? [matchStage] : []),
    { $sort: { wpm: -1, createdAt: -1 } },
    {
      $group: {
        _id: "$userEmail",
        userName: { $first: "$userName" },
        wpm: { $max: "$wpm" },
        doc: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: {
        newRoot: "$doc",
      },
    },
    { $sort: { wpm: -1, createdAt: -1 } },
    { $limit: limit },
  ];

  const results = await col.aggregate(pipeline).toArray();
  return results as DbScore[];
}
