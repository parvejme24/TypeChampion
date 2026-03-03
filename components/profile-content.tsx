"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { useUser } from "@/hooks/use-user";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ProfileContent() {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user, isLoading, error } = useUser(sessionStatus === "authenticated");
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "loading" || sessionStatus === "unauthenticated") {
    return (
      <div className="flex flex-1 items-center justify-center min-h-0 p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isLoading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-0 p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile. Please try again.";
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 min-h-0 p-8 text-center">
        <p className="text-danger">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const displayName = session?.user?.name ?? user.fullName ?? user.email;
  const isSessionOnly = user.fromDatabase === false;

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 py-12">
      <Card className="w-full max-w-md">
        {isSessionOnly && (
          <div className="rounded-t-lg bg-warning-100 dark:bg-warning-500/20 px-4 py-3 text-center text-sm text-warning-700 dark:text-warning-400 border-b border-warning-200 dark:border-warning-500/30">
            Profile not saved to database yet. Check DB connection and retry.
          </div>
        )}
        <CardHeader className="flex flex-col items-center gap-3 px-8 pt-8 pb-4">
          <Avatar
            isBordered
            size="lg"
            src={session?.user?.image ?? undefined}
            name={displayName ?? "User"}
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">Profile</h1>
            <p className="text-sm text-default-500">{user.email}</p>
            {user.isBlocked && (
              <Chip color="danger" size="sm" className="mt-2">
                Account blocked
              </Chip>
            )}
          </div>
        </CardHeader>
        <CardBody className="px-8 pb-8 pt-2 gap-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-default-500">Full name</span>
              <span className="text-foreground font-medium">
                {user.fullName || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-500">Email</span>
              <span className="text-foreground font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-500">Member since</span>
              <span className="text-foreground font-medium">
                {user.userCreatedDate
                  ? formatDate(user.userCreatedDate)
                  : isSessionOnly
                    ? "Not saved"
                    : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-500">Last login</span>
              <span className="text-foreground font-medium">
                {user.lastLoginTime
                  ? formatDate(user.lastLoginTime)
                  : isSessionOnly
                    ? "Not saved"
                    : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-default-500">Status</span>
              <Chip
                size="sm"
                color={user.isBlocked ? "danger" : "success"}
                variant="flat"
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </Chip>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-default-500">Role</span>
              <Chip
                size="sm"
                color={user.role === "admin" ? "primary" : "default"}
                variant="flat"
              >
                {user.role === "admin" ? "Admin" : "User"}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
