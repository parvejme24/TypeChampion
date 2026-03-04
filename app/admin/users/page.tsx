"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Switch } from "@heroui/switch";
import {
  fetchAllUsersApi,
  setUserRoleApi,
  setUserBlockedApi,
  type ApiUser,
} from "@/lib/api/users";

const userListKeys = { all: ["users", "list"] as const };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: userListKeys.all,
    queryFn: fetchAllUsersApi,
    enabled: status === "authenticated",
    // Always keep fresh: refetch when window focuses and poll every 5s
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
  const setBlocked = useMutation({
    mutationFn: ({ email, isBlocked }: { email: string; isBlocked: boolean }) =>
      setUserBlockedApi(email, isBlocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userListKeys.all });
    },
  });
  const setRole = useMutation({
    mutationFn: ({ email, role }: { email: string; role: "admin" | "user" }) =>
      setUserRoleApi(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userListKeys.all });
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const isAdminUser =
    (session?.user as { dbUser?: { role?: string } })?.dbUser?.role === "admin";

  const list = users ?? [];

  const filtered = useMemo(() => {
    return list.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "active" && u.isBlocked) return false;
      if (statusFilter === "blocked" && !u.isBlocked) return false;
      return true;
    });
  }, [list, roleFilter, statusFilter]);

  const totalUsers = list.length;
  const adminCount = list.filter((u) => u.role === "admin").length;
  const blockedCount = list.filter((u) => u.isBlocked).length;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto space-y-6">
      {/* Loading / error / forbidden states */}
      {status === "loading" || status === "unauthenticated" || (isLoading && !users) ? (
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-40 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[260px]">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="py-3 px-3">
                  <CardBody className="p-0 space-y-2">
                    <Skeleton className="h-3 w-20 rounded-lg" />
                    <Skeleton className="h-5 w-10 rounded-lg" />
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* Filters skeleton */}
          <Card>
            <CardBody className="px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-lg" />
                <Skeleton className="h-3 w-40 rounded-lg" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-40 rounded-lg" />
                <Skeleton className="h-10 w-40 rounded-lg" />
              </div>
            </CardBody>
          </Card>

          {/* Table skeleton */}
          <Card>
            <CardHeader className="flex items-center justify-between px-6 pt-6 pb-2">
              <Skeleton className="h-5 w-36 rounded-lg" />
            </CardHeader>
            <CardBody className="px-6 pb-6 pt-2">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-default-100 dark:border-default-50 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-32 rounded-lg" />
                        <Skeleton className="h-3 w-40 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-16 rounded-lg" />
                      <Skeleton className="h-6 w-16 rounded-lg" />
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-danger">
            {error instanceof Error ? error.message : "Failed to load users"}
          </p>
          <p className="text-sm text-default-500">
            This page is for admins only. If you are an admin, check the console for errors.
          </p>
          <Button variant="flat" onPress={() => router.push("/")}>
            Back to home
          </Button>
        </div>
      ) : !isAdminUser && users !== undefined ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-danger">Forbidden. Admin access required.</p>
          <Button variant="flat" onPress={() => router.push("/")}>
            Back to home
          </Button>
        </div>
      ) : null}

      {/* Hide rest of UI when in a blocking state */}
      {!(status === "loading" ||
        status === "unauthenticated" ||
        (isLoading && !users) ||
        error ||
        (!isAdminUser && users !== undefined)) && (
        <>
          {/* Header + summary */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">User management</h1>
              <p className="text-sm text-default-500 mt-1">
                View all accounts, update roles, and monitor account status.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="grid grid-cols-3 gap-3 min-w-[260px]">
                <Card className="py-2 px-3">
                  <CardBody className="p-0 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-default-500">
                      Total users
                    </span>
                    <span className="text-xl font-semibold">{totalUsers}</span>
                  </CardBody>
                </Card>
                <Card className="py-2 px-3">
                  <CardBody className="p-0 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-default-500">
                      Admins
                    </span>
                    <span className="text-xl font-semibold text-primary">
                      {adminCount}
                    </span>
                  </CardBody>
                </Card>
                <Card className="py-2 px-3">
                  <CardBody className="p-0 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-default-500">
                      Blocked
                    </span>
                    <span className="text-xl font-semibold text-danger">
                      {blockedCount}
                    </span>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardBody className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-default-500 uppercase">
                  Filters
                </p>
                <p className="text-xs text-default-500 mt-1">
                  Narrow down the list by role or account status.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select
                  size="sm"
                  label="Role"
                  labelPlacement="outside-left"
                  className="w-40"
                  selectedKeys={[roleFilter]}
                  onSelectionChange={(keys: Iterable<string>) => {
                    const key = (Array.from(keys)[0] ?? "all") as "all" | "admin" | "user";
                    setRoleFilter(key);
                  }}
                >
                  <SelectItem key="all" textValue="All">
                    All
                  </SelectItem>
                  <SelectItem key="user" textValue="Users">
                    Users
                  </SelectItem>
                  <SelectItem key="admin" textValue="Admins">
                    Admins
                  </SelectItem>
                </Select>
                <Select
                  size="sm"
                  label="Status"
                  labelPlacement="outside-left"
                  className="w-40"
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys: Iterable<string>) => {
                    const key = (Array.from(keys)[0] ?? "all") as
                      | "all"
                      | "active"
                      | "blocked";
                    setStatusFilter(key);
                  }}
                >
                  <SelectItem key="all" textValue="All">
                    All
                  </SelectItem>
                  <SelectItem key="active" textValue="Active">
                    Active
                  </SelectItem>
                  <SelectItem key="blocked" textValue="Blocked">
                    Blocked
                  </SelectItem>
                </Select>
              </div>
            </CardBody>
          </Card>

          {/* Users list */}
          <Card>
            <CardHeader className="flex items-center justify-between px-6 pt-6 pb-2">
              <div>
                <h2 className="text-lg font-semibold">All users</h2>
                <p className="text-xs text-default-500 mt-1">
                  {filtered.length} of {totalUsers} users shown.
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 pb-6 pt-2">
              {list.length === 0 ? (
                <p className="text-default-500 py-4 text-sm">No users yet.</p>
              ) : filtered.length === 0 ? (
                <p className="text-default-500 py-4 text-sm">
                  No users match the selected filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-default-200 dark:border-default-100 bg-default-100/50 dark:bg-default-50/10">
                        <th className="text-left py-3 px-2 font-medium">User</th>
                        <th className="text-left py-3 px-2 font-medium">Role</th>
                        <th className="text-left py-3 px-2 font-medium">Status</th>
                        <th className="text-left py-3 px-2 font-medium">Created</th>
                        <th className="text-left py-3 px-2 font-medium">Last login</th>
                        <th className="text-left py-3 px-2 font-medium">Change role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u: ApiUser) => (
                        <tr
                          key={u.email}
                          className="border-b border-default-100 dark:border-default-50 hover:bg-default-50/40 dark:hover:bg-default-50/5 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="sm"
                                isBordered
                                src={u.avatarUrl ?? undefined}
                                name={u.fullName || u.email}
                                className="flex-shrink-0"
                              />
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-medium text-foreground truncate">
                                  {u.fullName || "—"}
                                </span>
                                <span className="text-xs text-default-500 truncate">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={u.role === "admin" ? "primary" : "default"}
                            >
                              {u.role === "admin" ? "Admin" : "User"}
                            </Chip>
                          </td>
                          <td className="py-3 px-2">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={u.isBlocked ? "danger" : "success"}
                            >
                              {u.isBlocked ? "Blocked" : "Active"}
                            </Chip>
                          </td>
                          <td className="py-3 px-2 text-default-500">
                            {u.userCreatedDate ? formatDate(u.userCreatedDate) : "—"}
                          </td>
                          <td className="py-3 px-2 text-default-500">
                            {u.lastLoginTime ? formatDate(u.lastLoginTime) : "—"}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Select
                                size="sm"
                                className="max-w-28"
                                selectedKeys={[u.role]}
                                onSelectionChange={(keys: Iterable<string>) => {
                                  const key = (Array.from(keys)[0] ?? "") as
                                    | "admin"
                                    | "user";
                                  if (key && key !== u.role)
                                    setRole.mutate({ email: u.email, role: key });
                                }}
                                isDisabled={setRole.isPending || setBlocked.isPending}
                              >
                                <SelectItem key="user" textValue="User">
                                  User
                                </SelectItem>
                                <SelectItem key="admin" textValue="Admin">
                                  Admin
                                </SelectItem>
                              </Select>
                              <Switch
                                size="sm"
                                aria-label={u.isBlocked ? "Unblock user" : "Block user"}
                                isSelected={!u.isBlocked}
                                color={u.isBlocked ? "default" : "danger"}
                                isDisabled={
                                  setBlocked.isPending || u.email === session?.user?.email
                                }
                                onValueChange={(selected: boolean) =>
                                  setBlocked.mutate({
                                    email: u.email,
                                    isBlocked: !selected,
                                  })
                                }
                              >
                                {u.isBlocked ? "Blocked" : "Active"}
                              </Switch>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
