import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { MyTypedListContent } from "@/components/my-typed-list-content";

export default async function MyTypedListPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user) {
    redirect("/login");
  }
  return <MyTypedListContent />;
}
