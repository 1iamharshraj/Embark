import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          return null;
        }
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          college: user.college,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.college = user.college;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        college: token.college as string,
        isAdmin: token.isAdmin as boolean,
      };
      return session;
    },
  },
});

export { handler as GET, handler as POST };
