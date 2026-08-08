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
  institute: z.string().min(2, "Institute name is required"),
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  vertical: z.string().min(1, "Pick a topic vertical"),
  engagement: z.enum([
    "Guest lecture",
    "Webinar series",
    "Workshop / live case",
    "Curriculum partner",
    "Visiting faculty",
  ]),
  format: z.enum(["Online", "On campus", "Either works"]),
  dates: z.string().optional(),
  audienceSize: z.enum(["Under 60", "60–150", "150–300", "300+"]).optional(),
  budget: z.enum([
    "To be discussed",
    "Under ₹15,000",
    "₹15,000–30,000",
    "₹30,000–50,000",
    "₹50,000+",
  ]).optional(),
  message: z.string().optional(),
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

const engagementOptions = [
  "Guest lecture",
  "Webinar series",
  "Workshop / live case",
  "Curriculum partner",
  "Visiting faculty",
];
const formatOptions = ["Online", "On campus", "Either works"];
const audienceOptions = ["Under 60", "60–150", "150–300", "300+"];
const budgetOptions = [
  "To be discussed",
  "Under ₹15,000",
  "₹15,000–30,000",
  "₹30,000–50,000",
  "₹50,000+",
];

export default function InviteAnExpertPage() {
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
      engagement: "Guest lecture",
      format: "Either works",
      audienceSize: "60–150",
      budget: "To be discussed",
    },
  });

  useEffect(() => {
    if (session?.user?.name) setValue("name", session.user.name);
    if (session?.user?.email) setValue("email", session.user.email);
  }, [session, setValue]);

  const onSubmit = async (values: FormValues) => {
    const res = await fetch("/api/lecture-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      alert(data.error || "Could not submit request. Please try again.");
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
              <Eyebrow>For institutes</Eyebrow>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-charcoal leading-tight mb-5">
                Tell us about the session.
              </h1>
              <p className="text-lg text-inkSoft mb-8">
                Two minutes here saves you weeks of cold LinkedIn outreach. We come back with a
                shortlist of verified practitioners within 48 hours.
              </p>

              <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 sm:p-10">
                {!submitted ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Institute name <span className="text-orange">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("institute")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.institute && <span className="text-xs text-red-600">{errors.institute.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Your name & role <span className="text-orange">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Prof. Meena Rao, Placement chair"
                        {...register("name")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Work email <span className="text-orange">*</span>
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                      {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">Phone</label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Topic vertical <span className="text-orange">*</span>
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
                      <label className="text-sm font-semibold text-charcoal">
                        Type of engagement <span className="text-orange">*</span>
                      </label>
                      <select
                        {...register("engagement")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      >
                        {engagementOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.engagement && <span className="text-xs text-red-600">{errors.engagement.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">
                        Format <span className="text-orange">*</span>
                      </label>
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
                      {errors.format && <span className="text-xs text-red-600">{errors.format.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">Preferred date window</label>
                      <input
                        type="text"
                        placeholder="e.g. Second week of August"
                        {...register("dates")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">Audience size</label>
                      <select
                        {...register("audienceSize")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      >
                        {audienceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-charcoal">Honorarium budget</label>
                      <select
                        {...register("budget")}
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
                      >
                        {budgetOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-sm font-semibold text-charcoal">Tell us about the session</label>
                      <textarea
                        {...register("message")}
                        placeholder="Batch, course context, and what you want students to walk away with"
                        className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition min-h-[100px]"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                      <small className="text-xs text-inkSoft">
                        We reply within 2 working days with a shortlist or clarifying questions.
                      </small>
                      <Button type="submit" disabled={isSubmitting}>
                        Request a speaker
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
                    <h3 className="font-display font-bold text-2xl text-charcoal mb-2">Request received</h3>
                    <p className="text-sm text-inkSoft max-w-md mx-auto">
                      We&apos;ll write back within 2 working days with a shortlist. Check your inbox for a confirmation.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden lg:block space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
                <h3 className="font-display font-bold text-lg text-charcoal mb-4">What happens next</h3>
                <ol className="space-y-4 text-sm text-charcoal">
                  {[
                    "We read your brief and shortlist verified speakers who fit it — within 48 hours.",
                    "You pick from the shortlist; we confirm the speaker, date and honorarium.",
                    "The session happens. Your feedback goes on the speaker's record.",
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
              <div className="bg-navy text-cream rounded-3xl p-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">What you can count on</h3>
                <ul className="space-y-3 text-sm text-cream/85">
                  {[
                    "Every speaker identity- and employment-verified",
                    "Honorarium agreed upfront — no surprises after",
                    "Didn't like the shortlist? New names, no cost",
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
            </aside>
          </div>
        </div>
      </Container>
    </div>
  );
}
