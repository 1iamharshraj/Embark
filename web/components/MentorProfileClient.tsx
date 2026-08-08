"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import Button from "@/components/Button";

interface MentorProfileClientProps {
  mentor: {
    slug: string;
    name: string;
    image: string;
    role: string;
    company: string;
    college: string;
    batch: string;
    rating: number;
    sessions: number;
    years: number;
    price: number;
    guestLectures: boolean;
    expertise: string[];
    streams: string[];
    phases: number[];
    bio: string;
    reviewText: string;
    reviewWho: string;
  };
}

const phaseNames: Record<number, string> = {
  1: "Get into the right college",
  2: "Start strong",
  3: "Win your summers",
  4: "Win case competitions",
  5: "Land your final placement",
};

interface BookingFormProps {
  mentorSlug: string;
  mentorName: string;
}

function BookingForm({ mentorSlug, mentorName }: BookingFormProps) {
  const { data: session, status } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return <div className="text-sm text-inkSoft">Loading…</div>;
  }

  if (!session?.user) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-inkSoft mb-4">Sign in to book a session with {mentorName.split(" ")[0]}.</p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/mentor/${mentorSlug}`)}`}
          className="inline-flex items-center justify-center rounded-full bg-orangeDeep text-white px-7 py-3.5 font-semibold transition hover:bg-[#1740A8]"
        >
          Sign in to book
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-navySoft text-navy flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h3 className="font-display font-bold text-xl text-charcoal mb-2">Request sent</h3>
        <p className="text-sm text-inkSoft">We’ll confirm slots on email/WhatsApp within a day.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/mentorship/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorSlug, name, email, topic, message }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not send request. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Your name</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">What&apos;s the session about?</label>
        <textarea
          required
          minLength={10}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition min-h-[100px]"
          placeholder="The more specific, the better the session"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Anything else? (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition min-h-[80px]"
          placeholder="Preferred timing, background, or questions"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Sending…" : "Request a session"}
      </Button>
    </form>
  );
}

export default function MentorProfileClient({ mentor }: MentorProfileClientProps) {
  const [tab, setTab] = useState<"overview" | "mentorship" | "gl">("mentorship");
  const firstName = mentor.name.split(" ")[0];

  return (
    <>
      <header className="bg-white pt-12 pb-0">
        <Container>
          <div className="flex flex-wrap gap-6 items-start">
            <Image
              src={mentor.image}
              alt={mentor.name}
              width={128}
              height={128}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-[26px] object-cover shadow-[0_0_0_4px_#F4F7FC,0_12px_30px_rgba(22,22,22,0.18)] flex-none"
              unoptimized
            />
            <div className="flex-1 min-w-[200px]">
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-1 flex flex-wrap items-center gap-3">
                {mentor.name}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy bg-navySoft rounded-full px-3 py-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                  Verified
                </span>
              </h1>
              <p className="text-base text-inkSoft mb-3">
                {mentor.role} · {mentor.company}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy bg-navySoft rounded-full px-3 py-1">
                {mentor.college} {mentor.batch}
              </span>
              <div className="flex flex-wrap gap-8 mt-6">
                <div className="flex flex-col">
                  <b className="font-display font-extrabold text-2xl text-charcoal">
                    <span className="text-orangeDeep">★</span> {mentor.rating.toFixed(1)}
                  </b>
                  <span className="text-sm text-inkSoft">mentee rating</span>
                </div>
                <div className="flex flex-col">
                  <b className="font-display font-extrabold text-2xl text-charcoal">{mentor.sessions}</b>
                  <span className="text-sm text-inkSoft">sessions delivered</span>
                </div>
                <div className="flex flex-col">
                  <b className="font-display font-extrabold text-2xl text-charcoal">{mentor.years}</b>
                  <span className="text-sm text-inkSoft">years in industry</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-8 border-b border-charcoal/12">
            {[
              { id: "overview", label: "Overview" },
              { id: "mentorship", label: "Mentorship" },
              ...(mentor.guestLectures ? [{ id: "gl", label: "Guest lectures" }] : []),
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as typeof tab)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-[3px] -mb-[1.5px] transition ${
                  tab === t.id
                    ? "text-charcoal border-orange"
                    : "text-inkSoft border-transparent hover:text-charcoal"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Container>
      </header>

      <div className="py-12 sm:py-16 pb-24">
        <Container>
          <div className="grid lg:grid-cols-[1.35fr_0.8fr] gap-10 items-start">
            <div>
              {tab === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">About</h2>
                    <p className="text-[#2C323E] leading-relaxed">{mentor.bio}</p>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((e) => (
                        <span key={e} className="text-sm font-medium bg-white rounded-full px-4 py-2 shadow-[0_2px_8px_rgba(22,22,22,0.06)]">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Streams</h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.streams.map((s) => (
                        <span key={s} className="text-sm font-medium bg-white rounded-full px-4 py-2 shadow-[0_2px_8px_rgba(22,22,22,0.06)]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
                    <blockquote className="font-serif italic text-base text-charcoal leading-relaxed">
                      &ldquo;{mentor.reviewText}&rdquo;
                    </blockquote>
                    <cite className="block mt-4 text-sm text-inkSoft not-italic">— {mentor.reviewWho}</cite>
                  </div>
                </div>
              )}

              {tab === "mentorship" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">
                      How mentorship works with {firstName}
                    </h2>
                    <ul className="grid gap-3">
                      {[
                        "One-on-one video sessions, 45–60 minutes, on your schedule",
                        "Come with a specific problem — leave with a specific plan",
                        "Session notes and next steps in writing afterwards",
                        "Also available inside the end-to-end Journey — same mentor, bundled pricing",
                      ].map((li) => (
                        <li key={li} className="flex items-start gap-3 text-[#2C323E]">
                          <svg className="w-5 h-5 text-orange flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Journey phases covered</h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.phases.map((p) => (
                        <span key={p} className="text-sm font-medium bg-white rounded-full px-4 py-2 shadow-[0_2px_8px_rgba(22,22,22,0.06)]">
                          Phase {p} · {phaseNames[p]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)]">
                    <blockquote className="font-serif italic text-base text-charcoal leading-relaxed">
                      &ldquo;{mentor.reviewText}&rdquo;
                    </blockquote>
                    <cite className="block mt-4 text-sm text-inkSoft not-italic">— {mentor.reviewWho}</cite>
                  </div>
                </div>
              )}

              {tab === "gl" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">
                      Also available for guest lectures
                    </h2>
                    <p className="text-[#2C323E] leading-relaxed">
                      {firstName} is part of the verified speaker community — available to institutes for guest lectures, workshops and webinars on {mentor.streams.join(", ").toLowerCase()}.
                    </p>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-charcoal mb-3">Lecture topics</h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((e) => (
                        <span key={e} className="text-sm font-medium bg-white rounded-full px-4 py-2 shadow-[0_2px_8px_rgba(22,22,22,0.06)]">{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
                <div className="font-display font-extrabold text-3xl text-charcoal mb-1">
                  ₹{mentor.price.toLocaleString("en-IN")} <small className="font-body font-normal text-sm text-inkSoft">/ session</small>
                </div>
                <p className="text-sm text-inkSoft mb-5">
                  Indicative per-session price. Inside the Journey, sessions are bundled — <Link href="/mentorship#pricing" className="text-orangeDeep">see packaging</Link>.
                </p>
                <BookingForm mentorSlug={mentor.slug} mentorName={mentor.name} />
              </div>
              {mentor.guestLectures && (
                <div className="bg-navy text-cream rounded-3xl p-6">
                  <h3 className="font-display font-bold text-lg text-white mb-2">Bring {firstName} to your campus</h3>
                  <p className="text-sm text-cream/75 mb-4">Guest lectures are a B2B engagement for institutes — honorarium and logistics handled through the guest-lecture service.</p>
                  <Link href="/invite-an-expert" className="inline-flex items-center justify-center rounded-full bg-orange text-navy font-semibold text-sm px-5 py-2.5 hover:bg-white transition">
                    Invite to campus
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
