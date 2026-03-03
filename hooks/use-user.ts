"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiUser } from "@/lib/api/users";
import { fetchCurrentUser, setUserBlockedApi } from "@/lib/api/users";

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
};

export function useUser(enabled = true) {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: fetchCurrentUser,
    enabled,
  });
}

export function useSetUserBlocked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, isBlocked }: { email: string; isBlocked: boolean }) =>
      setUserBlockedApi(email, isBlocked),
    onSuccess: (data: ApiUser) => {
      queryClient.setQueryData(userKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
