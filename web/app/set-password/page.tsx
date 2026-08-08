"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Container from "@/components/Container";
import Button from "@/components/Button";

const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
  });

  useEffect(() => {
    if (!email || !token) {
      setValidating(false);
      return;
    }

    async function validate() {
      try {
        const res = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });
        const json = await res.json();
        setValid(!!json.valid);
      } catch {
        setValid(false);
      } finally {
        setValidating(false);
      }
    }

    validate();
  }, [email, token]);

  async function onSubmit(data: SetPasswordForm) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.message || "Something went wrong.");
        return;
      }
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  if (validating) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center">
            <p className="text-inkSoft">Checking your reset link…</p>
          </div>
        </Container>
      </section>
    );
  }

  if (!valid || !email || !token) {
    return (
      <section className="bg-cream py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10 text-center">
            <h1 className="font-display font-bold text-2xl text-charcoal mb-3">
              Link expired or invalid
            </h1>
            <p className="text-inkSoft text-sm mb-6">
              This link has expired or is invalid. Please request a new password reset link.
            </p>
            <Link
              href="/reset-password"
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition"
            >
              Request new link
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal mb-2">
            Set new password
          </h1>
          <p className="text-inkSoft text-sm mb-6">Create a new password for {email}.</p>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-charcoal">
                New password
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-charcoal">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <span className="text-xs text-red-600">{errors.confirmPassword.message}</span>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}

export default function SetPasswordPage() {
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
      <SetPasswordForm />
    </Suspense>
  );
}
