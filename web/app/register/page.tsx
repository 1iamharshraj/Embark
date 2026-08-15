"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Container from "@/components/Container";
import Button from "@/components/Button";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    college: z.string().optional().default(""),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal mb-2">
            Create an account
          </h1>
          <p className="text-inkSoft text-sm mb-6">
            Join Embark India to register for competitions, save playbooks, and book mentors.
          </p>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-charcoal">
                Full name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                placeholder="Ajay Kumar"
              />
              {errors.name && (
                <span className="text-xs text-red-600">{errors.name.message}</span>
              )}
            </div>

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
              <label htmlFor="college" className="text-sm font-semibold text-charcoal">
                College / Institute / Company <span className="text-inkSoft">(optional)</span>
              </label>
              <input
                id="college"
                type="text"
                {...register("college")}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                placeholder="e.g. IIM Ahmedabad or Acme Corp"
              />
              {errors.college && (
                <span className="text-xs text-red-600">{errors.college.message}</span>
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-charcoal">
                Confirm password
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
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-inkSoft text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-orange hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
