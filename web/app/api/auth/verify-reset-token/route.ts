import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const verifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const { email, token } = parsed.data;
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    const valid =
      !!resetToken &&
      resetToken.email.toLowerCase().trim() === email.toLowerCase().trim() &&
      resetToken.expiresAt > new Date();

    return NextResponse.json({ valid }, { status: 200 });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
