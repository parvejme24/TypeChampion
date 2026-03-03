export interface ApiUser {
  email: string;
  fullName: string;
  userCreatedDate: string | null;
  lastLoginTime: string | null;
  isBlocked: boolean;
  role: string;
  /** Present and true when data came from DB; false when session-only fallback */
  fromDatabase?: boolean;
}

export async function fetchCurrentUser(): Promise<ApiUser | null> {
  const res = await fetch("/api/users/me", { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Failed to load profile");
  }
  return res.json();
}

export async function setUserBlockedApi(
  email: string,
  isBlocked: boolean
): Promise<ApiUser> {
  const res = await fetch(`/api/users/${encodeURIComponent(email)}/block`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isBlocked }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update");
  }
  return res.json();
}

/** Admin only: get all users */
export async function fetchAllUsersApi(): Promise<ApiUser[]> {
  const res = await fetch("/api/users", { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Failed to load users");
  }
  return res.json();
}

/** Admin only: change a user's role */
export async function setUserRoleApi(
  email: string,
  role: "admin" | "user"
): Promise<ApiUser> {
  const res = await fetch(`/api/users/${encodeURIComponent(email)}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update role");
  }
  return res.json();
}
