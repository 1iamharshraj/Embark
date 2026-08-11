import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { prisma } from "./prisma";

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  college: string;
  isAdmin: boolean;
  roles: string[];
  permissions: string[];
}

export async function requireAuth(req?: NextRequest): Promise<AuthorizedUser> {
  const session = req
    ? await getServerSession(authOptions)
    : await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user as AuthorizedUser;
}

export function hasPermission(
  user: AuthorizedUser | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  if (user.isAdmin || user.roles.includes("Super Admin")) return true;
  return user.permissions.includes(permission);
}

export function hasRole(
  user: AuthorizedUser | null | undefined,
  role: string
): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function requirePermission(
  user: AuthorizedUser,
  permission: string
): void {
  if (!hasPermission(user, permission)) {
    throw new Error("FORBIDDEN");
  }
}

export function requireRole(user: AuthorizedUser, role: string): void {
  if (!hasRole(user, role)) {
    throw new Error("FORBIDDEN");
  }
}

export function requireResourceOwner(
  user: AuthorizedUser,
  ownerId: string
): void {
  if (user.isAdmin || user.roles.includes("Super Admin")) return;
  if (user.id !== ownerId) {
    throw new Error("FORBIDDEN");
  }
}

export async function checkPagePermission(permission: string): Promise<AuthorizedUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as AuthorizedUser | undefined;
  if (!user?.id || !hasPermission(user, permission)) {
    redirect("/account");
  }
  return user;
}

export async function refreshUserPermissions(userId: string) {
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
