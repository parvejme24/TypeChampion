"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { fetchAllUsersApi, setUserRoleApi, type ApiUser } from "@/lib/api/users";

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
  const { data: users, isLoading, error } = useQuery({
    queryKey: userListKeys.all,
    queryFn: fetchAllUsersApi,
    enabled: status === "authenticated",
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

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  const isAdminUser =
    (session?.user as { dbUser?: { role?: string } })?.dbUser?.role === "admin";

  if (!isAdminUser && users !== undefined) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-danger">Forbidden. Admin access required.</p>
        <Button variant="flat" onPress={() => router.push("/")}>
          Back to home
        </Button>
      </div>
    );
  }

  if (isLoading && !users) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  const list = users ?? [];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
          <h1 className="text-2xl font-semibold">All users</h1>
          <p className="text-sm text-default-500">
            Manage roles. Only admins can access this page.
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-2">
          {list.length === 0 ? (
            <p className="text-default-500 py-4">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200 dark:border-default-100">
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Name</th>
                    <th className="text-left py-3 px-2 font-medium">Role</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Created</th>
                    <th className="text-left py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((u: ApiUser) => (
                    <tr
                      key={u.email}
                      className="border-b border-default-100 dark:border-default-50"
                    >
                      <td className="py-3 px-2">{u.email}</td>
                      <td className="py-3 px-2">{u.fullName || "—"}</td>
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
                      <td className="py-3 px-2">
                        <Select
                          size="sm"
                          className="max-w-24"
                          selectedKeys={[u.role]}
                          onSelectionChange={(keys) => {
                            const key = (Array.from(keys)[0] ?? "") as "admin" | "user";
                            if (key && key !== u.role)
                              setRole.mutate({ email: u.email, role: key });
                          }}
                          isDisabled={setRole.isPending}
                        >
                          <SelectItem key="user" textValue="User">
                            User
                          </SelectItem>
                          <SelectItem key="admin" textValue="Admin">
                            Admin
                          </SelectItem>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
