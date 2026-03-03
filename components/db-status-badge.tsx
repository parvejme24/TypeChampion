"use client";

import { useQuery } from "@tanstack/react-query";
import { Chip } from "@heroui/chip";

async function fetchHealth(): Promise<{ status: string; db: string }> {
  const res = await fetch("/api/health", { credentials: "include" });
  return res.json();
}

export function DbStatusBadge() {
  const { data } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
  if (!data) return null;
  const connected = data.db === "connected";
  return (
    <Chip
      size="sm"
      variant="flat"
      color={connected ? "success" : "danger"}
      title={connected ? "Database connected" : "Database disconnected"}
    >
      DB {connected ? "connected" : "disconnected"}
    </Chip>
  );
}
