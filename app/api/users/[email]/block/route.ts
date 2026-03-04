import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { setUserBlocked } from "@/lib/db-users";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);
  const body = await _req.json().catch(() => ({}));
  const isBlocked = Boolean(body.isBlocked);

  // Optional: restrict to admin only – for now any authenticated user can update
  const updated = await setUserBlocked(decodedEmail, isBlocked);
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    email: updated.email,
    fullName: updated.fullName,
    userCreatedDate: updated.userCreatedDate.toISOString(),
    lastLoginTime: updated.lastLoginTime.toISOString(),
    isBlocked: updated.isBlocked,
  });
}
