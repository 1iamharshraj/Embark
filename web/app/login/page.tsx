"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
      return;
    }

    if (!result?.ok) {
      setServerError("Something went wrong. Please try again.");
      return;
    }

    const session = await getSession();
    const user = session?.user;

    // New users must finish persona onboarding before entering the app.
    if (user && user.onboardingComplete === false) {
      router.push("/getting-started");
      return;
    }

    // Respect an explicit deep-link callback, otherwise route by role.
    const hasExplicitCallback =
      callbackUrl && callbackUrl !== "/account" && callbackUrl !== "/login";

    if (hasExplicitCallback) {
      router.push(callbackUrl);
      return;
    }

    if (user?.roles?.includes("Expert")) {
      router.push("/expert/dashboard");
    } else if (user?.isAdmin) {
      router.push("/admin");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <section className="min-h-screen bg-cream flex">
      {/* Left brand panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-navy text-cream relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-baseline font-display font-extrabold text-2xl tracking-tight"
            aria-label="Embark India home"
          >
            <span className="text-cream">e</span>
            <span className="text-orange">MBA</span>
            <span className="text-cream">rk</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-orange border-[1.5px] border-orange/40 rounded-full px-4 py-1.5 mb-6">
            For experts & speakers
          </span>
          <h2 className="font-display font-bold text-3xl xl:text-4xl leading-tight text-white mb-4">
            Share what you practice. Shape the next generation of MBA talent.
          </h2>
          <p className="text-cream/75 text-base leading-relaxed mb-8">
            Sign in to manage your expert profile, sessions, bookings and
            priority DMs. New here? Apply to join the speaker network.
          </p>

          <ul className="space-y-4">
            {[
              "List mentorship services and packages",
              "Accept bookings and priority DMs",
              "Track earnings and reviews in one place",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-cream/90">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-orange/20 text-orange flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-cream/50">
            Part of Embark India — built for tier-2 MBA students.
          </p>
        </div>

        {/* Decorative blobs */}
        <svg
          className="absolute -top-24 -right-24 w-[420px] opacity-20 pointer-events-none"
          viewBox="0 0 330 300"
          aria-hidden="true"
        >
          <path
            fill="#2E6BFF"
            d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z"
          />
        </svg>
        <svg
          className="absolute -bottom-32 -left-32 w-[520px] opacity-15 pointer-events-none"
          viewBox="0 0 330 300"
          aria-hidden="true"
        >
          <path
            fill="#2E6BFF"
            d="M246 27c35 27 57 73 49 112-8 40-46 73-90 86-45 13-95 6-125-22C50 175 40 126 55 86 69 46 107 16 150 9c37-6 70 0 96 18Z"
          />
        </svg>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-baseline font-display font-extrabold text-2xl tracking-tight"
              aria-label="Embark India home"
            >
              <span className="text-charcoal">e</span>
              <span className="text-orange">MBA</span>
              <span className="text-charcoal">rk</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10">
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal mb-2">
                Sign in
              </h1>
              <p className="text-inkSoft text-sm">
                Enter your email and password to access your account.
              </p>
            </div>

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
              <Link
                href="/reset-password"
                className="font-semibold text-orange hover:underline"
              >
                Forgot password?
              </Link>
              <Link href="/register" className="font-semibold text-orange hover:underline">
                Create account
              </Link>
            </div>
          </div>

          {/* Expert CTA card */}
          <div className="mt-5 bg-white rounded-2xl border border-charcoal/8 p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orangeSoft text-orangeDeep flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-charcoal text-sm">Are you an expert or speaker?</p>
              <p className="text-xs text-inkSoft mt-1 mb-2">
                Apply to share your experience with MBA students.
              </p>
              <Link
                href="/become-a-speaker"
                className="text-xs font-semibold text-orange hover:underline"
              >
                Apply to become a speaker →
              </Link>
            </div>
          </div>

          <div className="mt-6 text-xs text-inkSoft space-y-1">
            <p>Admin demo: ajay.san36@gmail.com / admin123</p>
            <p>Student demo: student@embark.local / student123</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <p className="text-inkSoft">Loading…</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
