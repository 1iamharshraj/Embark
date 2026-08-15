"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/Button";
import { cn } from "@/lib/cn";

const schema = z
  .object({
    persona: z.enum(["student", "expert", "institution", "recruiter"]),
    // Student fields
    college: z.string().optional(),
    graduationYear: z.coerce.number().min(1950).max(2050).optional(),
    specialization: z.string().optional(),
    targetIndustry: z.string().optional(),
    targetRoles: z.string().optional(),
    skills: z.string().optional(),
    interests: z.string().optional(),
    bio: z.string().optional(),
    linkedIn: z.string().optional(),
    location: z.string().optional(),
    // Organization fields
    name: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    roleIntent: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.persona === "student") {
      if (!data.college || data.college.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "College is required",
          path: ["college"],
        });
      }
      return;
    }

    if (data.persona === "expert") {
      // Expert details are collected in the dedicated onboarding wizard.
      return;
    }

    if (!data.name || data.name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Organization name is required",
        path: ["name"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const personas = [
  {
    key: "student",
    title: "MBA Student",
    subtitle: "Competitions, hackathons, playbooks & mentorship",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    key: "expert",
    title: "Industry Professional",
    subtitle: "Mentor, speak, or offer career guidance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "institution",
    title: "College / Institute",
    subtitle: "Request guest lectures or curriculum partners",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M2 22h20" />
        <path d="M12 2v20" />
        <path d="M4 10l8-6 8 6" />
      </svg>
    ),
  },
  {
    key: "recruiter",
    title: "Company / Recruiter",
    subtitle: "Hire from the Embark student community",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
] as const;

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; optional?: boolean }
>(function Input({ label, error, optional, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">
        {label} {optional && <span className="text-inkSoft">(optional)</span>}
      </label>
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition",
          className
        )}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; optional?: boolean }
>(function TextArea({ label, error, optional, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">
        {label} {optional && <span className="text-inkSoft">(optional)</span>}
      </label>
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition min-h-[100px]",
          className
        )}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

export default function GettingStartedForm({ userName }: { userName: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState<"persona" | "details">("persona");
  const [selectedPersona, setSelectedPersona] = useState<(typeof personas)[number]["key"] | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { persona: "student" },
  });

  function selectPersona(key: (typeof personas)[number]["key"]) {
    setSelectedPersona(key);
    reset({ persona: key });
  }

  function continueToDetails() {
    if (!selectedPersona) return;
    if (selectedPersona === "expert") {
      // Industry Professional flows directly to the dedicated expert onboarding wizard.
      handleSubmit(onSubmit)();
      return;
    }
    setStep("details");
  }

  function goBack() {
    setStep("persona");
    setSelectedPersona(null);
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
        onboardingComplete?: boolean;
        roles?: string[];
        permissions?: string[];
      };
      if (!res.ok || !json.ok) {
        toast.error(json.error || "Could not save. Please try again.");
        return;
      }

      // Refresh the session token so middleware no longer redirects here.
      await update({
        onboardingComplete: json.onboardingComplete ?? true,
        onboardingRole: values.persona === "expert" ? "Expert" : values.persona === "institution" ? "Institution" : values.persona === "recruiter" ? "Recruiter" : "Student",
        roles: json.roles,
        permissions: json.permissions,
      });

      toast.success(values.persona === "expert" ? "Let’s set up your expert profile." : "Profile set up!");
      router.push(json.redirectTo || "/account");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const personaAction = selectedPersona
    ? {
        student: { verb: "Create your student profile", body: "Get access to competitions, hackathons, playbooks and mentorship." },
        expert: { verb: "Create your expert page", body: "Share your expertise, offer sessions, and get booked by MBA students." },
        institution: { verb: "Create your institute page", body: "Request guest lectures and curriculum partners for your college." },
        recruiter: { verb: "Create your company page", body: "Hire from the Embark student community." },
      }[selectedPersona]
    : null;

  if (step === "persona") {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">
            Welcome, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-inkSoft mt-2">Which of these best describes why you&apos;re here?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {personas.map((p) => {
            const active = selectedPersona === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => selectPersona(p.key)}
                className={`group text-left rounded-2xl border-2 p-5 transition ${
                  active
                    ? "border-orangeDeep bg-orange/5 shadow-[0_8px_24px_rgba(22,22,22,0.08)]"
                    : "border-charcoal/10 bg-white hover:border-orangeDeep hover:shadow-[0_8px_24px_rgba(22,22,22,0.08)]"
                }`}
              >
                <div className={`mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl ${active ? "bg-orangeDeep text-white" : "bg-orange/10 text-orangeDeep"}`}>
                  {p.icon}
                </div>
                <p className="font-display font-bold text-lg text-charcoal">{p.title}</p>
                <p className="text-sm text-inkSoft mt-1">{p.subtitle}</p>
              </button>
            );
          })}
        </div>

        {personaAction && (
          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06)]">
            <p className="font-display font-bold text-lg text-charcoal">{personaAction.verb}</p>
            <p className="text-sm text-inkSoft mt-1">{personaAction.body}</p>
            <button
              type="button"
              onClick={continueToDetails}
              disabled={saving}
              className="mt-4 w-full inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition disabled:opacity-60"
            >
              {saving ? "Continuing…" : `${personaAction.verb} →`}
            </button>
          </div>
        )}
      </div>
    );
  }

  const title = personas.find((p) => p.key === selectedPersona)?.title ?? "Your profile";

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={goBack} className="text-sm font-semibold text-charcoal hover:text-orange mb-3">
          ← Back to personas
        </button>
        <h2 className="font-display font-bold text-2xl text-charcoal">{title}</h2>
        <p className="text-inkSoft text-sm mt-1">A few quick details to get you to the right place.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("persona")} />

        {selectedPersona === "student" && (
          <>
            <Input label="College / Institute" {...register("college")} error={errors.college?.message} />
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="Expected graduation year" type="number" {...register("graduationYear")} error={errors.graduationYear?.message} />
              <Input label="Specialization" optional {...register("specialization")} error={errors.specialization?.message} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="Target industry" optional {...register("targetIndustry")} error={errors.targetIndustry?.message} />
              <Input label="Dream roles (comma separated)" optional {...register("targetRoles")} error={errors.targetRoles?.message} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="Skills (comma separated)" optional {...register("skills")} error={errors.skills?.message} />
              <Input label="Interests (comma separated)" optional {...register("interests")} error={errors.interests?.message} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="LinkedIn" optional {...register("linkedIn")} error={errors.linkedIn?.message} />
              <Input label="Location" optional {...register("location")} error={errors.location?.message} />
            </div>
            <TextArea label="Short bio" optional {...register("bio")} error={errors.bio?.message} />
          </>
        )}

        {selectedPersona === "expert" && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-orangeDeep/20 bg-orange/5 p-6 space-y-4">
              <p className="font-semibold text-charcoal">What happens next?</p>
              <ul className="space-y-2 text-sm text-inkSoft">
                <li className="flex items-start gap-2">
                  <span className="text-orangeDeep">1.</span>
                  <span>Build your expert profile (role, company, bio, social links).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orangeDeep">2.</span>
                  <span>Pick your areas of expertise and the services you want to offer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orangeDeep">3.</span>
                  <span>Set your weekly availability and WhatsApp number for bookings.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {(selectedPersona === "institution" || selectedPersona === "recruiter") && (
          <>
            <Input
              label={selectedPersona === "institution" ? "Institute / College name" : "Company name"}
              {...register("name")}
              error={errors.name?.message}
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="City" optional {...register("city")} error={errors.city?.message} />
              <Input label="Phone" optional {...register("phone")} error={errors.phone?.message} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="Website" optional {...register("website")} error={errors.website?.message} />
              <Input
                label={selectedPersona === "institution" ? "Affiliation / Accreditation" : "Industry"}
                optional
                {...register("industry")}
                error={errors.industry?.message}
              />
            </div>
            <TextArea
              label={
                selectedPersona === "institution"
                  ? "What kind of sessions are you looking for?"
                  : "What roles do you usually hire for?"
              }
              optional
              {...register("roleIntent")}
              error={errors.roleIntent?.message}
            />
          </>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={saving}>
            {saving
              ? "Saving…"
              : selectedPersona === "expert"
              ? "Continue to expert setup →"
              : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
