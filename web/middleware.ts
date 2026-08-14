import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/reset-password",
  "/set-password",
  "/api",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/icon",
  "/offline.html",
];

function isPublic(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

const ADMIN_ROLES = new Set(["Super Admin", "Admin", "Operations Admin", "Hackathon Admin"]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const roles = (token.roles as string[]) || [];

  // Admin routes
  if (pathname.startsWith("/admin")) {
    const isAdmin = token.isAdmin || roles.some((r) => ADMIN_ROLES.has(r));
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // Expert dashboard routes — onboarding is open to ALL logged-in users
  // so any user can become an expert via the wizard.
  if (pathname.startsWith("/expert") && !pathname.startsWith("/expert/onboarding")) {
    const isExpert = roles.includes("Expert") || token.isAdmin;
    if (!isExpert) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // Judge portal routes
  if (pathname.startsWith("/judge")) {
    const isJudge = roles.includes("Evaluator") || roles.includes("Super Admin") || token.isAdmin;
    if (!isJudge) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // Student routes just require auth (handled above).

  // Forward the pathname so server layouts can detect the current route
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/expert/:path*",
    "/judge/:path*",
    "/student/:path*",
  ],
};
