import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      college: string;
      isAdmin: boolean;
      onboardingComplete: boolean;
      onboardingRole: string | null;
      roles: string[];
      permissions: string[];
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    college?: string;
    isAdmin?: boolean;
    onboardingComplete?: boolean;
    onboardingRole?: string | null;
    roles?: string[];
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    college?: string;
    isAdmin?: boolean;
    onboardingComplete?: boolean;
    onboardingRole?: string | null;
    roles?: string[];
    permissions?: string[];
  }
}
