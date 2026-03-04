import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { getAllUsers } from "@/lib/db-users";
import { isAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
  }
  try {
    const users = await getAllUsers();
    return NextResponse.json(
      users.map((u) => ({
        email: u.email,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl ?? null,
        userCreatedDate: u.userCreatedDate.toISOString(),
        lastLoginTime: u.lastLoginTime.toISOString(),
        isBlocked: u.isBlocked,
        role: u.role ?? "user",
      }))
    );
  } catch (err) {
    console.error("[API users list]", err);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 503 }
    );
  }
}
