"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import Container from "@/components/Container";

function ReviewWriteContent() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId") || undefined;
  const dmId = params.get("dmId") || undefined;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl mx-auto">
          <Link
            href="/account"
            className="inline-flex items-center text-sm font-semibold text-orangeDeep hover:underline mb-6"
          >
            ← Back to account
          </Link>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Write a review</h1>
          <p className="text-inkSoft mb-8">Share your experience to help others.</p>
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <ReviewForm bookingId={bookingId} dmId={dmId} onSubmitted={() => {}} />
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function ReviewWritePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-inkSoft">Loading…</div>}>
      <ReviewWriteContent />
    </Suspense>
  );
}
