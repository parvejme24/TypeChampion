import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getUserByEmail } from "@/lib/db-users";

export async function isAdmin(): Promise<boolean> {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) return false;
  const role = session.user.dbUser?.role;
  if (role === "admin") return true;
  const dbUser = await getUserByEmail(session.user.email);
  return dbUser?.role === "admin";
}
