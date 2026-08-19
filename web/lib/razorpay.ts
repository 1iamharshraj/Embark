import Razorpay from "razorpay";

export function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment."
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function isTestRazorpaySecret(): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  return !secret || secret === "..." || secret.startsWith("test_secret_") || secret.includes("placeholder");
}
