import { NextAuthOptions, User } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXT_AUTH_SECRET!,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });
        if (!user || !user?.password || !user?.verified) {
          return null;
        }
        const verfied = await compare(credentials.password, user?.password);
        if (!verfied) {
          return null;
        }
        return {
          id: `${user.id}`,
          name: user.name,
          email: user.email,
          image: user?.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user: profile, account }) {
      if (account?.provider === "google") {
        const user = await db.query.users.findFirst({
          where: eq(users.email, profile?.email!),
        });
        if(!profile?.email || !profile?.name || !profile?.image) return false;
        if (!user) {
          const userOBj:typeof users.$inferInsert={
            name:profile?.name!,
            email:profile?.email!,
            image:profile?.image!,
          }
          await db.insert(users).values(userOBj);
          return true;
        }
        if (!user?.image) {
          await db.update(users).set({ image: profile?.image }).where(eq(users.id, user.id));
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          username: user.name,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, token?.email!),
        });
        return {
          ...session,
          user: {
            ...session.user,
            id:user?.id,
            name: token.name,
          },
        };
      }
      return session;
    },
  },
};
