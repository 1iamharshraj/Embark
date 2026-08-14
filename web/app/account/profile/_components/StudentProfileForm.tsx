"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const commaList = (val: string | undefined) =>
  (val || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const studentProfileSchema = z.object({
  college: z.string().min(1, "College is required"),
  degree: z.string().optional(),
  specialization: z.string().optional(),
  graduationYear: z.coerce.number().min(1950).max(2050).optional(),
  currentSemester: z.string().optional(),
  targetIndustry: z.string().optional(),
  targetRoles: z.string().optional(),
  skills: z.string().optional(),
  interests: z.string().optional(),
  resumeUrl: z.string().optional(),
  portfolio: z.string().optional(),
  bio: z.string().optional(),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean().optional(),
});

type StudentProfileFormData = z.infer<typeof studentProfileSchema>;

interface StudentProfileFormProps {
  initial: StudentProfileFormData;
}

export function StudentProfileForm({ initial }: StudentProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: initial,
  });

  async function onSubmit(data: StudentProfileFormData) {
    setServerError("");
    try {
      const payload = {
        ...data,
        targetRoles: commaList(data.targetRoles),
        skills: commaList(data.skills),
        interests: commaList(data.interests),
      };
      const res = await fetch("/api/v1/students/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.message || "Failed to update student profile.");
        return;
      }
      toast.success("Student profile updated");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  const field = (label: string, id: string, type = "text", extra?: string) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-charcoal">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          {...register(id as keyof StudentProfileFormData)}
          className={`w-full rounded-xl bg-white border border-charcoal/10 px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition ${extra}`}
        />
      ) : type === "checkbox" ? (
        <label className="flex items-center gap-3 rounded-xl bg-white border border-charcoal/10 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            {...register(id as keyof StudentProfileFormData)}
            className="w-4 h-4 rounded border-charcoal/20 text-orangeDeep focus:ring-orange/40"
          />
          <span className="text-sm text-charcoal">{label}</span>
        </label>
      ) : (
        <input
          id={id}
          type={type}
          {...register(id as keyof StudentProfileFormData)}
          className={`w-full rounded-xl bg-white border border-charcoal/10 px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition ${extra}`}
        />
      )}
      {errors[id as keyof StudentProfileFormData] && (
        <span className="text-xs text-red-600">
          {errors[id as keyof StudentProfileFormData]?.message}
        </span>
      )}
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div className="rounded-2xl bg-cream p-5 sm:p-6 space-y-5">
      <h3 className="font-display font-bold text-lg text-charcoal">{title}</h3>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {serverError}
        </div>
      )}

      {section(
        "Education",
        <div className="grid sm:grid-cols-2 gap-5">
          {field("College / Institute", "college")}
          {field("Degree", "degree")}
          {field("Specialization", "specialization")}
          {field("Graduation year", "graduationYear", "number")}
          {field("Current semester", "currentSemester")}
        </div>
      )}

      {section(
        "Career goals",
        <div className="grid sm:grid-cols-2 gap-5">
          {field("Target industry", "targetIndustry")}
          {field("Target roles (comma-separated)", "targetRoles")}
          {field("Skills (comma-separated)", "skills")}
          {field("Interests (comma-separated)", "interests")}
        </div>
      )}

      {section(
        "Links",
        <div className="grid sm:grid-cols-2 gap-5">
          {field("Resume URL", "resumeUrl", "url")}
          {field("Portfolio", "portfolio", "url")}
          {field("LinkedIn", "linkedIn", "url")}
          {field("Website", "website", "url")}
        </div>
      )}

      {section(
        "About",
        <div className="space-y-5">
          {field("Location", "location")}
          {field("Bio", "bio", "textarea")}
        </div>
      )}

      {section(
        "Visibility",
        <div className="space-y-5">
          {field("Make my student profile visible to other users", "isPublic", "checkbox")}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save student profile"}
      </button>
    </form>
  );
}
