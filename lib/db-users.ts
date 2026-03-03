import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

const USERS_COLLECTION = "users";

export type UserRole = "admin" | "user";

export interface DbUser {
  _id?: ObjectId;
  email: string;
  fullName: string;
  userCreatedDate: Date;
  lastLoginTime: Date;
  isBlocked: boolean;
  role?: UserRole;
}

/** Upsert user on login: set userCreatedDate only on insert, always update lastLoginTime and fullName */
export async function upsertUserOnLogin(input: {
  email: string;
  name?: string | null;
}): Promise<DbUser> {
  const db = await getDb();
  const col = db.collection<DbUser>(USERS_COLLECTION);
  const now = new Date();

  const result = await col.findOneAndUpdate(
    { email: input.email },
    {
      $set: {
        fullName: input.name ?? input.email,
        lastLoginTime: now,
      },
      $setOnInsert: {
        email: input.email,
        userCreatedDate: now,
        isBlocked: false,
        role: "user",
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  if (!result) {
    throw new Error("Upsert user failed");
  }
  return result as DbUser;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const db = await getDb();
  const col = db.collection<DbUser>(USERS_COLLECTION);
  return col.findOne({ email });
}

export async function setUserBlocked(
  email: string,
  isBlocked: boolean
): Promise<DbUser | null> {
  const db = await getDb();
  const col = db.collection<DbUser>(USERS_COLLECTION);
  const result = await col.findOneAndUpdate(
    { email },
    { $set: { isBlocked } },
    { returnDocument: "after" }
  );
  return result as DbUser | null;
}

export async function getAllUsers(): Promise<DbUser[]> {
  const db = await getDb();
  const col = db.collection<DbUser>(USERS_COLLECTION);
  const cursor = col.find({}).sort({ userCreatedDate: -1 });
  return cursor.toArray();
}

export async function setUserRole(
  email: string,
  role: UserRole
): Promise<DbUser | null> {
  const db = await getDb();
  const col = db.collection<DbUser>(USERS_COLLECTION);
  const result = await col.findOneAndUpdate(
    { email },
    { $set: { role } },
    { returnDocument: "after" }
  );
  return result as DbUser | null;
}
