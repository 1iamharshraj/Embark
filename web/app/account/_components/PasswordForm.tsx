"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function PasswordForm() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(data: PasswordForm) {
    setServerError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.message || "Failed to update password.");
        return;
      }
      setSuccess(true);
      reset();
      toast.success("Password updated");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {serverError}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 text-green-800 text-sm px-4 py-3">
          Password updated successfully.
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="currentPassword" className="text-sm font-semibold text-charcoal">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          placeholder="••••••••"
        />
        {errors.currentPassword && (
          <span className="text-xs text-red-600">{errors.currentPassword.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-semibold text-charcoal">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          {...register("newPassword")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          placeholder="••••••••"
        />
        {errors.newPassword && (
          <span className="text-xs text-red-600">{errors.newPassword.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmNewPassword" className="text-sm font-semibold text-charcoal">
          Confirm new password
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          {...register("confirmNewPassword")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          placeholder="••••••••"
        />
        {errors.confirmNewPassword && (
          <span className="text-xs text-red-600">{errors.confirmNewPassword.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
      >
        {isSubmitting ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
