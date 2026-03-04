import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";

export default async function PracticePage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user) redirect("/login");
  redirect("/my-typed-list");
}
