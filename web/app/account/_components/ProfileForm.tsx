"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  college: z.string().min(1, "College is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialName: string;
  initialCollege: string;
  email: string;
}

export function ProfileForm({ initialName, initialCollege, email }: ProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialName,
      college: initialCollege,
    },
  });

  async function onSubmit(data: ProfileForm) {
    setServerError("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.message || "Failed to update profile.");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-email" className="text-sm font-semibold text-charcoal">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          disabled
          className="w-full rounded-xl bg-cream/70 border border-transparent px-4 py-3 text-inkSoft cursor-not-allowed"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-name" className="text-sm font-semibold text-charcoal">
          Full name
        </label>
        <input
          id="profile-name"
          type="text"
          {...register("name")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
        {errors.name && (
          <span className="text-xs text-red-600">{errors.name.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-college" className="text-sm font-semibold text-charcoal">
          College / Institute
        </label>
        <input
          id="profile-college"
          type="text"
          {...register("college")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
        {errors.college && (
          <span className="text-xs text-red-600">{errors.college.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
