declare module "next-auth" {
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
