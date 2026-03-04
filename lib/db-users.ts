import prisma from "./prisma";

export type UserRole = "admin" | "user";

export interface DbUser {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  userCreatedDate: Date;
  lastLoginTime: Date;
  isBlocked: boolean;
  role?: UserRole;
}

/** Upsert user on login: set userCreatedDate only on insert, always update lastLoginTime and fullName */
export async function upsertUserOnLogin(input: {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<DbUser> {
  const now = new Date();

  const user = await prisma.user.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      fullName: input.name ?? input.email,
      avatarUrl: input.avatarUrl ?? null,
      userCreatedDate: now,
      lastLoginTime: now,
      isBlocked: false,
      role: "user",
    },
    update: {
      fullName: input.name ?? input.email,
      avatarUrl: input.avatarUrl ?? null,
      lastLoginTime: now,
    },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    userCreatedDate: user.userCreatedDate,
    lastLoginTime: user.lastLoginTime,
    isBlocked: user.isBlocked,
    role: (user.role as UserRole | null) ?? "user",
  };
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    userCreatedDate: user.userCreatedDate,
    lastLoginTime: user.lastLoginTime,
    isBlocked: user.isBlocked,
    role: (user.role as UserRole | null) ?? "user",
  };
}

export async function setUserBlocked(
  email: string,
  isBlocked: boolean
): Promise<DbUser | null> {
  const user = await prisma.user.update({
    where: { email },
    data: { isBlocked },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    userCreatedDate: user.userCreatedDate,
    lastLoginTime: user.lastLoginTime,
    isBlocked: user.isBlocked,
    role: (user.role as UserRole | null) ?? "user",
  };
}

export async function getAllUsers(): Promise<DbUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { userCreatedDate: "desc" },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    userCreatedDate: user.userCreatedDate,
    lastLoginTime: user.lastLoginTime,
    isBlocked: user.isBlocked,
    role: (user.role as UserRole | null) ?? "user",
  }));
}

export async function setUserRole(
  email: string,
  role: UserRole
): Promise<DbUser | null> {
  const user = await prisma.user.update({
    where: { email },
    data: { role },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    userCreatedDate: user.userCreatedDate,
    lastLoginTime: user.lastLoginTime,
    isBlocked: user.isBlocked,
    role: (user.role as UserRole | null) ?? "user",
  };
}
