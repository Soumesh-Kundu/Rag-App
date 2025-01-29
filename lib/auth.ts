import { NextAuthOptions, User } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
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
        const user = await db.users.findFirst({
          where: { email: credentials.email },
        });
        if (!user || !user?.password || !user?.verified) {
          return null;
        }
        const verfied = await compare(credentials.password, user.password);
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
      async profile(profile) {
        let user=await db.users.upsert({where:{email:profile.email},update:{image:profile.picture},create:{email:profile.email,name:profile.name,image:profile.picture},select:{id:true}});
        return {
          id: `${user?.id}`,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    // async signIn({ user: profile, account }) {
    //   console.log("from sign in",profile,account)
    //   if (account?.provider === "google") {
    //     const user = await db.users.findFirst({
    //       where: { id: parseInt(profile.id) },
    //     });
    //     if(!profile?.email || !profile?.name || !profile?.image) return false;
    //     if (!user) {
    //       const userOBj={
    //         name:profile.name,
    //         email:profile.email,
    //         image:profile.image,
    //       }
    //       await db.users.create({data:userOBj});
    //       return true;
    //     }
    //     if (!user?.image) {
    //       await db.users.update({where:{id:user.id},data:{image:profile.image}});
    //     }
    //     return true;
    //   }
    //   return true;
    // },
    async jwt({ token, user }) {
      console.log("from jwt",token,user)
      if (user) {
        return {
          ...token,
          id:user.id,
          username: user.name,
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log("from session",session,token)
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id:token?.id,
            name: token.name,
          },
        };
      }
      return session;
    },
  },
};
