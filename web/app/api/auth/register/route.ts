import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyWelcome } from "@/lib/notifications";
import { createEmailVerificationToken } from "@/lib/email-verification";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  college: z.string().optional().default(""),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ADMIN_EMAILS = new Set([
  "ajay.san36@gmail.com",
  "admin@embark.local",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, college, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        college: college.trim(),
        password: hashedPassword,
        isAdmin: ADMIN_EMAILS.has(normalizedEmail),
        onboardingComplete: false,
      },
    });

    // Role selection now happens on /getting-started after the first login.
    // We do not assign a default role here so the user can pick student, expert,
    // institution, or recruiter during onboarding.

    try {
      await notifyWelcome(user.id);
    } catch (err) {
      console.error("Welcome notification failed:", err);
    }

    try {
      await createEmailVerificationToken(user.email);
    } catch (err) {
      console.error("Email verification token creation failed:", err);
    }

    return NextResponse.json({ ok: true, requiresEmailVerification: true }, { status: 200 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
