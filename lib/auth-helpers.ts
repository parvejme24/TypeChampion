import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getUserByEmail } from "@/lib/db-users";

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const role = session.user.dbUser?.role;
  if (role === "admin") return true;
  const dbUser = await getUserByEmail(session.user.email);
  return dbUser?.role === "admin";
}
