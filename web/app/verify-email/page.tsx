"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import Button from "@/components/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token, email]);

  return (
    <section className="bg-cream min-h-screen flex items-center py-16 sm:py-24">
      <Container>
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10 text-center">
          <h1 className="font-display font-bold text-2xl text-charcoal mb-4">
            {status === "success" ? "Email verified" : status === "error" ? "Verification failed" : "Verifying email"}
          </h1>
          <p className={`text-sm mb-6 ${status === "success" ? "text-green-700" : status === "error" ? "text-red-700" : "text-inkSoft"}`}>
            {message}
          </p>
          {status === "success" ? (
            <Button href="/login">Continue to login</Button>
          ) : status === "error" ? (
            <div className="space-y-3">
              <p className="text-xs text-inkSoft">
                Didn&apos;t receive the email? Make sure to check your spam folder or request a new link after logging in.
              </p>
              <Link href="/login" className="text-sm font-semibold text-orangeDeep hover:underline">
                Go to login
              </Link>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <section className="bg-cream min-h-screen flex items-center py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 sm:p-10 text-center">
            <h1 className="font-display font-bold text-2xl text-charcoal mb-4">Verifying email</h1>
            <p className="text-sm text-inkSoft">Please wait...</p>
          </div>
        </Container>
      </section>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
