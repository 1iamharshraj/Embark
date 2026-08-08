"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import Button from "@/components/Button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setServerError("");
    const result = await signIn("credentials", {
      email: data.email.toLowerCase().trim(),
      password: data.password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Invalid email or password.");
    } else if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal mb-2">
            Sign in
          </h1>
          <p className="text-inkSoft text-sm mb-6">
            Enter your email and password to access your account.
          </p>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-charcoal">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                placeholder="you@example.com"
              />
              {errors.email && (
                <span className="text-xs text-red-600">{errors.email.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-charcoal">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                placeholder="••••••••"
              />
              {errors.password && (
                <span className="text-xs text-red-600">{errors.password.message}</span>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-inkSoft">
            <Link href="/reset-password" className="font-semibold text-orange hover:underline">
              Forgot password?
            </Link>
            <Link href="/register" className="font-semibold text-orange hover:underline">
              Create account
            </Link>
          </div>

          <div className="mt-6 text-xs text-inkSoft space-y-1">
            <p>Admin demo: ajay.san36@gmail.com / admin123</p>
            <p>Student demo: student@embark.local / student123</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-cream py-16 sm:py-24">
          <Container>
            <div className="max-w-md mx-auto text-center">
              <p className="text-inkSoft">Loading…</p>
            </div>
          </Container>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
