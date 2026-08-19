import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/reset-password",
  "/set-password",
  "/getting-started",
  "/expert/onboarding",
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

// CORS
const CORS_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const CORS_HEADERS = "Content-Type, Authorization, X-Requested-With";
const CORS_MAX_AGE = "86400";

function getOrigin(request: NextRequest): string {
  const requestOrigin = request.headers.get("origin") || "";
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (allowedOrigin && requestOrigin && allowedOrigin.includes(requestOrigin)) {
    return requestOrigin;
  }
  return requestOrigin || allowedOrigin || "*";
}

function applyCorsHeaders(response: NextResponse, origin: string) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", CORS_METHODS);
  response.headers.set("Access-Control-Allow-Headers", CORS_HEADERS);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", CORS_MAX_AGE);
  return response;
}

function corsPreflightResponse(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) return null;
  if (request.method !== "OPTIONS") return null;

  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(response, getOrigin(request));
}

// Rate limiting (in-memory, per-process)
interface WindowEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, WindowEntry>();

function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.ip || "unknown";
}

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  if (isPrivateIp(ip)) return false;

  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

function rateLimitResponse(): NextResponse {
  return new NextResponse(JSON.stringify({ message: "Too many requests. Please try again later." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": "60",
    },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Handle CORS preflight before anything else.
  const preflight = corsPreflightResponse(request);
  if (preflight) return preflight;

  // Rate limiting for API routes.
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    if (pathname.startsWith("/api/auth/")) {
      if (isRateLimited(ip, 30, 60 * 1000)) return rateLimitResponse();
    } else {
      if (isRateLimited(ip, 200, 60 * 1000)) return rateLimitResponse();
    }
  }

  if (isPublic(pathname)) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    if (pathname.startsWith("/api/")) applyCorsHeaders(response, getOrigin(request));
    return response;
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

  // New users must finish the persona onboarding before using the app.
  if (token.onboardingComplete === false) {
    return NextResponse.redirect(new URL("/getting-started", request.url));
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

  // Forward the pathname so server layouts can detect the current route
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  if (pathname.startsWith("/api/")) applyCorsHeaders(response, getOrigin(request));
  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/expert/:path*",
    "/judge/:path*",
    "/student/:path*",
    "/api/:path*",
  ],
};
