import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { setUserRole } from "@/lib/db-users";
import type { UserRole } from "@/lib/db-users";
import { isAdmin } from "@/lib/auth-helpers";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
  }
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);
  const body = await _req.json().catch(() => ({}));
  const role = body.role as UserRole | undefined;
  if (role !== "admin" && role !== "user") {
    return NextResponse.json(
      { error: "Invalid role. Use 'admin' or 'user'" },
      { status: 400 }
    );
  }
  const updated = await setUserRole(decodedEmail, role);
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    email: updated.email,
    fullName: updated.fullName,
    userCreatedDate: updated.userCreatedDate.toISOString(),
    lastLoginTime: updated.lastLoginTime.toISOString(),
    isBlocked: updated.isBlocked,
    role: updated.role ?? "user",
  });
}
