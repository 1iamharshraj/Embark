import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createEmailVerificationToken } from "@/lib/email-verification";

const resendSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { ok: true, message: "If your email is registered, you will receive a verification link." },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { ok: true, message: "Email is already verified." },
        { status: 200 }
      );
    }

    await createEmailVerificationToken(email);

    return NextResponse.json(
      { ok: true, message: "Verification email sent. Please check your inbox." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
