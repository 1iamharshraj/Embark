import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  try {
    const user = await requireAuth();
    requirePermission(user, "dashboard.view");

    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized) return normalized;
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ message: "Failed to load dashboard" }, { status: 500 });
  }
}
