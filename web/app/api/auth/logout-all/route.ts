import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revokeRefreshTokens } from "@/lib/authOptions";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await revokeRefreshTokens(session.user.id);
    return NextResponse.json({ ok: true, message: "Logged out from all devices." }, { status: 200 });
  } catch (error) {
    console.error("Logout all devices error:", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
