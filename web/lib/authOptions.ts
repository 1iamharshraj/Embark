import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { randomBytes } from "crypto";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  college: string;
  isAdmin: boolean;
  onboardingComplete: boolean;
  onboardingRole: string | null;
  roles: string[];
  permissions: string[];
}

async function getUserRolesAndPermissions(userId: string) {
  const userWithRoles = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithRoles) {
    return { roles: [] as string[], permissions: [] as string[] };
  }

  const roles = userWithRoles.roles.map((ur) => ur.role.name);
  const permissionsSet = new Set<string>();
  userWithRoles.roles.forEach((ur) => {
    ur.role.permissions.forEach((rp) => {
      permissionsSet.add(`${rp.permission.resource}.${rp.permission.action}`);
    });
  });

  return { roles, permissions: Array.from(permissionsSet) };
}

export async function createRefreshToken(userId: string) {
  const token = randomBytes(64).toString("hex");
  const tokenHash = token; // In production, hash with bcrypt or sha256
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function revokeRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          college: "",
          isAdmin: false,
        };
      },
    }),
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
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !user.password) {
          return null;
        }
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        const { roles, permissions } = await getUserRolesAndPermissions(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          college: user.college,
          isAdmin: user.isAdmin,
          onboardingComplete: user.onboardingComplete,
          onboardingRole: user.onboardingRole,
          roles,
          permissions,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days for local dev; 15 minutes in production
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        const authUser = user as AuthUser;
        token.college = authUser.college || "";
        token.isAdmin = authUser.isAdmin ?? false;
        token.roles = authUser.roles || [];
        token.permissions = authUser.permissions || [];
        token.onboardingComplete = authUser.onboardingComplete ?? false;
        token.onboardingRole = authUser.onboardingRole ?? null;
      }

      // Support client-side session updates (e.g. profile changes).
      if (trigger === "update") {
        if (session?.name) token.name = session.name;
        if (typeof session?.onboardingComplete === "boolean") {
          token.onboardingComplete = session.onboardingComplete;
        }
        if (session?.onboardingRole !== undefined) {
          token.onboardingRole = session.onboardingRole;
        }
        if (Array.isArray(session?.roles)) {
          token.roles = session.roles;
        }
        if (Array.isArray(session?.permissions)) {
          token.permissions = session.permissions;
        }
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
        onboardingComplete: (token.onboardingComplete as boolean) ?? false,
        onboardingRole: (token.onboardingRole as string | null) ?? null,
        roles: (token.roles as string[]) || [],
        permissions: (token.permissions as string[]) || [],
      };
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await revokeRefreshTokens(token.id as string);
      }
    },
    async signIn({ user, account }) {
      // For OAuth sign-ins, ensure the user has the Student role by default.
      if (account?.provider === "google" && user.id) {
        const studentRole = await prisma.role.findUnique({ where: { name: "Student" } });
        if (studentRole) {
          await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: user.id,
                roleId: studentRole.id,
              },
            },
            update: {},
            create: {
              userId: user.id,
              roleId: studentRole.id,
            },
          });
        }
      }
    },
  },
};
