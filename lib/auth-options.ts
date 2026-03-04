import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUserOnLogin, getUserByEmail } from "./db-users";
import { sendLoginEmail } from "./email";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn({ user }: { user: { email?: string | null; name?: string | null; image?: string | null } }) {
      if (!user.email) return false;
      try {
        const dbUser = await upsertUserOnLogin({
          email: user.email,
          name: user.name ?? undefined,
          avatarUrl: user.image ?? null,
        });
        if (dbUser.isBlocked) {
          console.error("[Auth] Sign-in denied: account is blocked", user.email);
          return false;
        }
        // Fire-and-forget login email; don't block sign-in if it fails
        void sendLoginEmail(user.email, user.name).catch((err) => {
          console.error("[Auth] Failed to send login email:", err);
        });
        return true;
      } catch (err) {
        // Log so you can see the real error in the terminal (e.g. MongoDB connection)
        console.error("[Auth] Sign-in DB error (allowing sign-in anyway):", err);
        // Allow sign-in even when DB fails so users aren't stuck with 403
        return true;
      }
    },
    async jwt({ token, user }: { token: import("next-auth/jwt").JWT; user?: { email?: string | null } }) {
      const email = token.email ?? user?.email;
      if (email) {
        try {
          const dbUser = await getUserByEmail(email);
          if (dbUser) {
            token.dbUser = {
              fullName: dbUser.fullName,
              email: dbUser.email,
              userCreatedDate: dbUser.userCreatedDate.toISOString(),
              lastLoginTime: dbUser.lastLoginTime.toISOString(),
              isBlocked: dbUser.isBlocked,
              role: dbUser.role ?? "user",
            };
          }
        } catch (err) {
          console.error("[Auth] JWT callback DB error:", err);
        }
      }
      return token;
    },
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      if (session.user && token.dbUser) {
        session.user.dbUser = token.dbUser;
      }
      return session;
    },
  },
};
