import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getUserByEmail, upsertUserOnLogin } from "@/lib/db-users";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let dbUser = await getUserByEmail(session.user.email);
    if (!dbUser) {
      dbUser = await upsertUserOnLogin({
        email: session.user.email,
        name: session.user.name ?? undefined,
        avatarUrl: session.user.image ?? null,
      });
    }
    return NextResponse.json({
      email: dbUser.email,
      fullName: dbUser.fullName,
      avatarUrl: dbUser.avatarUrl ?? session.user.image ?? null,
      userCreatedDate: dbUser.userCreatedDate.toISOString(),
      lastLoginTime: dbUser.lastLoginTime.toISOString(),
      isBlocked: dbUser.isBlocked,
      role: dbUser.role ?? "user",
      fromDatabase: true,
    });
  } catch (err) {
    console.error("[API users/me] MongoDB error, returning session-only profile:", err);
    return NextResponse.json({
      email: session.user.email,
      fullName: session.user.name ?? session.user.email ?? "",
      avatarUrl: session.user.image ?? null,
      userCreatedDate: null,
      lastLoginTime: null,
      isBlocked: false,
      role: "user",
      fromDatabase: false,
    });
  }
}
