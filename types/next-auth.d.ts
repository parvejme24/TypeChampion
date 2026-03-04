declare module "next-auth" {
  // Allow authOptions to be used with getServerSession (next-auth/next)
  export type NextAuthOptions = Record<string, unknown>;

  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      dbUser?: {
        fullName: string;
        email: string;
        userCreatedDate: string;
        lastLoginTime: string;
        isBlocked: boolean;
        role: string;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string;
    dbUser?: {
      fullName: string;
      email: string;
      userCreatedDate: string;
      lastLoginTime: string;
      isBlocked: boolean;
      role: string;
    };
  }
}
