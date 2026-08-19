import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireResourceOwner, AuthorizedUser } from "@/lib/rbac";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const blockedDate = await prisma.blockedDate.findUnique({
      where: { id: params.id },
      include: { expertProfile: { select: { userId: true } } },
    });

    if (!blockedDate) {
      return NextResponse.json({ message: "Blocked date not found" }, { status: 404 });
    }

    const sessionUser = session.user as AuthorizedUser;
    if (!sessionUser.isAdmin) {
      requireResourceOwner(sessionUser, blockedDate.expertProfile.userId);
      requirePermission(sessionUser, "service.update");
    }

    await prisma.blockedDate.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to delete blocked date" }, { status: 500 });
  }
}
