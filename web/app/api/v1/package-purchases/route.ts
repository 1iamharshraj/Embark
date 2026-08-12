import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { packageId } = body;

    if (!packageId || typeof packageId !== "string") {
      return NextResponse.json({ message: "packageId is required" }, { status: 400 });
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId, isActive: true },
    });

    if (!pkg) {
      return NextResponse.json({ message: "Package not found" }, { status: 404 });
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + pkg.validityDays);

    const purchase = await prisma.packagePurchase.create({
      data: {
        packageId: pkg.id,
        studentId: session.user.id,
        status: "ACTIVE",
        validUntil,
        amount: pkg.price,
      },
    });

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error) {
    console.error("Package purchase error:", error);
    return NextResponse.json({ message: "Failed to purchase package" }, { status: 500 });
  }
}
