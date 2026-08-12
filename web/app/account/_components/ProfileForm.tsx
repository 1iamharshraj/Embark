"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  isPublic: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initial: ProfileFormData;
  email: string;
}

export function ProfileForm({ initial, email }: ProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });

  async function onSubmit(data: ProfileFormData) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

      <Controller
        name="image"
        control={control}
        render={({ field }) => <ImageUpload value={field.value || ""} onChange={field.onChange} />}
      />

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
        {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-phone" className="text-sm font-semibold text-charcoal">
          Phone
        </label>
        <input
          id="profile-phone"
          type="tel"
          {...register("phone")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-bio" className="text-sm font-semibold text-charcoal">
          Bio
        </label>
        <textarea
          id="profile-bio"
          rows={3}
          {...register("bio")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-location" className="text-sm font-semibold text-charcoal">
          Location
        </label>
        <input
          id="profile-location"
          type="text"
          {...register("location")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-linkedin" className="text-sm font-semibold text-charcoal">
          LinkedIn URL
        </label>
        <input
          id="profile-linkedin"
          type="url"
          {...register("linkedIn")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-website" className="text-sm font-semibold text-charcoal">
          Website
        </label>
        <input
          id="profile-website"
          type="url"
          {...register("website")}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-cream border border-transparent px-4 py-3 cursor-pointer">
        <input type="checkbox" {...register("isPublic")} className="rounded" />
        <span className="text-sm text-charcoal">Make my profile visible to other users</span>
      </label>

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
