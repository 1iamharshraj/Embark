import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { AuthorizedUser } from "@/lib/rbac";

const updateSchema = z.object({
  status: z.enum(["PAID", "ASSIGNED", "IN_PROGRESS", "RESPONDED", "COMPLETED", "CANCELLED", "EXPIRED"]).optional(),
  response: z.string().optional(),
  responseAttachments: z.array(z.string()).optional(),
});

async function canView(sessionUser: AuthorizedUser, dmId: string) {
  const dm = await prisma.priorityDM.findUnique({
    where: { id: dmId },
    select: { id: true, expertId: true, studentId: true },
  });

  if (!dm) return { error: "Priority DM not found", status: 404 };
  if (!sessionUser.isAdmin && dm.studentId !== sessionUser.id && dm.expertId !== sessionUser.id) {
    return { error: "Forbidden", status: 403 };
  }
  return { dm };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await canView(session.user as AuthorizedUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const dm = await prisma.priorityDM.findUnique({
      where: { id: params.id },
      include: {
        expert: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ dm });
  } catch (error) {
    console.error("Priority DM fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch priority DM" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { status, response, responseAttachments } = parsed.data;
    const sessionUser = session.user as AuthorizedUser;

    const result = await canView(sessionUser, params.id);
    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const dm = await prisma.priorityDM.findUnique({
      where: { id: params.id },
      select: { id: true, expertId: true, status: true },
    });

    if (!dm) {
      return NextResponse.json({ message: "Priority DM not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (response !== undefined) {
      data.response = response.trim();
      data.responseAt = new Date();
      if (!status) data.status = "RESPONDED";
    }
    if (responseAttachments) data.responseAttachments = responseAttachments;

    if (response !== undefined && dm.expertId !== sessionUser.id && !sessionUser.isAdmin) {
      return NextResponse.json({ message: "Only the expert can respond" }, { status: 403 });
    }

    const updated = await prisma.priorityDM.update({
      where: { id: params.id },
      data,
      include: {
        expert: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ dm: updated });
  } catch (error) {
    console.error("Priority DM update error:", error);
    return NextResponse.json({ message: "Failed to update priority DM" }, { status: 500 });
  }
}
