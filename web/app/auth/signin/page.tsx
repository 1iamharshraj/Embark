"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/account",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else if (result?.ok) {
      window.location.href = "/account";
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

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-charcoal">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-charcoal">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-xs text-inkSoft space-y-1">
            <p>Admin demo: ajay.san36@gmail.com / admin123</p>
            <p>Student demo: student@embark.local / student123</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
