import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { ProfileContent } from "@/components/profile-content";

export default async function ProfilePage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user) {
    redirect("/login");
  }
  return <ProfileContent />;
}
