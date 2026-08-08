"use client";

import { useRouter } from "next/navigation";
import RazorpayButton from "@/components/RazorpayButton";

interface PayButtonProps {
  bookingId: string;
  mentorName: string;
  mentorSlug: string;
  amount: number;
}

export default function PayButton({ bookingId, mentorName, mentorSlug, amount }: PayButtonProps) {
  const router = useRouter();
  return (
    <RazorpayButton
      type="mentorship"
      bookingRequestId={bookingId}
      playbook={{ slug: mentorSlug, name: mentorName, price: amount }}
      label={`Pay ₹${amount.toLocaleString("en-IN")}`}
      size="sm"
      onSuccess={() => router.refresh()}
    />
  );
}
