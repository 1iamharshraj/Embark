"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.string().min(2, "Current role & company is required"),
  company: z.string().min(1, "Company is required"),
  linkedIn: z.string().url("Enter a valid LinkedIn URL").min(1, "LinkedIn URL is required"),
  experience: z.enum(["3–6 years", "6–10 years", "10–15 years", "15+ years"]),
  vertical: z.string().min(1, "Pick a vertical"),
  city: z.string().optional(),
  format: z.enum(["Online only", "On campus only", "Both"]),
  topics: z.string().min(10, "Tell us a few topics you'd speak on"),
});

type FormValues = z.infer<typeof schema>;

const verticals = [
  "Marketing",
  "Sales",
  "Communication",
  "Statistics",
  "Finance",
  "Analytics",
  "Economics",
  "Supply chain",
  "Market Research",
  "Entrepreneurship",
  "Consulting",
  "Strategy",
  "Product Management",
  "Project Management",
  "Something else",
];

const experienceOptions = ["3–6 years", "6–10 years", "10–15 years", "15+ years"];
const formatOptions = ["Online only", "On campus only", "Both"];

export default function BecomeASpeakerPage() {
  const [submitted, setSubmitted] = useState(false);
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      experience: "3–6 years",
      format: "Both",
    },
  });

  useEffect(() => {
    if (session?.user?.name) setValue("name", session.user.name);
    if (session?.user?.email) setValue("email", session.user.email);
  }, [session, setValue]);

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/speaker-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      alert(data.error || "Could not submit application. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="bg-cream min-h-screen py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_0.7fr] gap-12 items-start">
            <div>
              <Eyebrow>For professionals</Eyebrow>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-charcoal leading-tight mb-5">
                Share what you practice.
              </h1>
              <p className="text-lg text-inkSoft mb-8">
                One lecture at a time, on your schedule. We handle the finding, the logistics and
                the honorarium conversation — you do the telling.
              </p>

              <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10">
                {!submitted ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Full name <span className="text-orange">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("name")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Email <span className="text-orange">*</span>
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Current role <span className="text-orange">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Manager"
                        {...register("role")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.role && <span className="text-xs text-red-600">{errors.role.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Company <span className="text-orange">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HUL"
                        {...register("company")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.company && <span className="text-xs text-red-600">{errors.company.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-sm font-semibold text-charcoal">
                        LinkedIn URL <span className="text-orange">*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="linkedin.com/in/you"
                        {...register("linkedIn")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.linkedIn && <span className="text-xs text-red-600">{errors.linkedIn.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Years of experience <span className="text-orange">*</span>
                      </label>
                      <select
                        {...register("experience")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      >
                        {experienceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.experience && <span className="text-xs text-red-600">{errors.experience.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Strongest vertical <span className="text-orange">*</span>
                      </label>
                      <select
                        {...register("vertical")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      >
                        <option value="">Pick a vertical</option>
                        {verticals.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                      {errors.vertical && <span className="text-xs text-red-600">{errors.vertical.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">City</label>
                      <input
                        type="text"
                        {...register("city")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">Formats you&apos;re open to</label>
                      <select
                        {...register("format")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      >
                        {formatOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-sm font-semibold text-charcoal">
                        Topics you&apos;d love to speak on
                      </label>
                      <textarea
                        {...register("topics")}
                        placeholder="Two or three topics you could teach tomorrow, in your own words"
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition min-h-[100px]"
                      />
                      {errors.topics && <span className="text-xs text-red-600">{errors.topics.message}</span>}
                    </div>

                    <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                      <small className="text-xs text-inkSoft">
                        Verification takes about a week — we check identity and current role, nothing more invasive.
                      </small>
                      <Button type="submit" disabled={isSubmitting}>
                        Apply to join
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-navySoft text-navy flex items-center justify-center mx-auto mb-5">
                      <svg
                        viewBox="0 0 24 24"
                        width="30"
                        height="30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-2xl text-charcoal mb-2">Application received</h3>
                    <p className="text-sm text-inkSoft max-w-md mx-auto">
                      We&apos;ll begin verification and get back within a week. Meanwhile, think about the topic you&apos;d open
                      with.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden lg:block space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
                <h3 className="font-display font-bold text-lg text-charcoal mb-4">Why professionals join</h3>
                <ul className="space-y-3 text-sm text-charcoal">
                  {[
                    "Reach classrooms across India without the outreach grind",
                    "Build a public speaking record and personal brand",
                    "Set your own honorarium expectations and availability",
                    "Decline any invitation, no questions asked",
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-orange flex-none mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-navy text-cream rounded-3xl p-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">How joining works</h3>
                <ol className="space-y-4 text-sm text-cream/85">
                  {[
                    "Apply with this form — five minutes, no documents yet.",
                    "We verify identity and current role within a week.",
                    "You're listed. Invitations that match your expertise land in your inbox.",
                  ].map((li, i) => (
                    <li key={li} className="flex gap-3">
                      <span className="flex-none w-6 h-6 rounded-full bg-orange text-white flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {li}
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </div>
  );
}
