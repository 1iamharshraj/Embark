import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailToken } from "@/lib/email-verification";

const verifySchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Please enter a valid email"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, token } = parsed.data;
    const ok = await verifyEmailToken(email, token);

    if (!ok) {
      return NextResponse.json(
        { message: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, message: "Email verified successfully." }, { status: 200 });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
