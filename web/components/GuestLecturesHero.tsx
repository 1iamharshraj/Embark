"use client";

import Image from "next/image";
import Link from "next/link";

const peopleA = [
  { img: "/assets/people/p1.jpg", name: "Kavitha Venkat", role: "Marketing leader", co: "HUL" },
  { img: "/assets/people/p3.jpg", name: "Shruti Nambiar", role: "Analytics director", co: "Flipkart" },
  { img: "/assets/people/p6.jpg", name: "Arjun Mehta", role: "Finance VP", co: "HDFC Bank" },
  { img: "/assets/people/p9.jpg", name: "Ananya Rao", role: "HR director", co: "Deloitte" },
];

const peopleB = [
  { img: "/assets/people/p2.jpg", name: "Abhinav Rathi", role: "Strategy lead", co: "McKinsey" },
  { img: "/assets/people/p5.jpg", name: "Divya Krishnan", role: "Product director", co: "Razorpay" },
  { img: "/assets/people/p8.jpg", name: "Vivek Iyer", role: "Sales head", co: "Amazon" },
  { img: "/assets/people/p11.jpg", name: "Nikita Shah", role: "Consultant", co: "BCG" },
];

function PersonCard({ p }: { p: { img: string; name: string; role: string; co: string } }) {
  return (
    <div className="people-card">
      <div className="pc-img relative">
        <Image
          src={p.img}
          alt=""
          width={300}
          height={300}
          className="w-full aspect-square object-cover"
          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          unoptimized
        />
        <span className="pc-badge">{p.co}</span>
      </div>
      <b>{p.name}</b>
      <span>{p.role}</span>
    </div>
  );
}

export default function GuestLecturesHero() {
  return (
    <header className="guest-hero relative overflow-hidden bg-cream py-14 sm:py-16 lg:py-20">
      <svg
        className="hero-blob tr"
        viewBox="0 0 330 300"
        aria-hidden="true"
      >
        <path
          fill="#2E6BFF"
          d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z"
        />
      </svg>
      <svg
        className="hero-blob bl"
        viewBox="0 0 300 270"
        aria-hidden="true"
      >
        <path
          fill="#2E6BFF"
          d="M246 27c35 27 57 73 49 112-8 40-46 73-90 86-45 13-95 6-125-22C50 175 40 126 55 86 69 46 107 16 150 9c37-6 70 0 96 18Z"
        />
      </svg>

      <div className="max-w-[1120px] mx-auto px-6 relative z-[1]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
          <div className="hero-copy">
            <h1 className="font-display font-extrabold text-[clamp(2.1rem,4.4vw,3.3rem)] leading-[1.07] tracking-tight text-charcoal">
              Bring <span className="text-orange">industry</span> into your{" "}
              <span className="scribble relative whitespace-nowrap">
                classroom
                <svg
                  className="absolute left-0 -bottom-[0.16em] w-full h-[0.3em] overflow-visible"
                  viewBox="0 0 300 24"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 18 C 80 6, 220 6, 296 14"
                    fill="none"
                    stroke="#2E6BFF"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="14 13"
                  />
                </svg>
              </span>
            </h1>
            <p className="hero-sub">
              Verified practitioners for guest lectures, workshops and more — online or on campus.
            </p>
            <div className="doors">
              <Link href="/invite-an-expert" className="door door-college">
                <span className="door-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4 6 8-4 8 4-8 4-8-4z" />
                    <path d="M4 6v6c0 2 3.6 4 8 4s8-2 8-4V6" />
                    <path d="M20 6v8" />
                  </svg>
                </span>
                <span className="door-text">
                  <b>Invite an expert</b>
                  <span>For institutes</span>
                </span>
                <span className="door-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
              <Link href="/become-a-speaker" className="door door-expert">
                <span className="door-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v3" />
                  </svg>
                </span>
                <span className="door-text">
                  <b>I am an expert</b>
                  <span>For professionals</span>
                </span>
                <span className="door-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          <div className="people-wall hidden lg:grid" aria-hidden="true">
            <div className="people-col">
              <div className="people-track">
                {[...peopleA, ...peopleA].map((p, i) => (
                  <PersonCard key={`a-${i}`} p={p} />
                ))}
              </div>
            </div>
            <div className="people-col reverse">
              <div className="people-track">
                {[...peopleB, ...peopleB].map((p, i) => (
                  <PersonCard key={`b-${i}`} p={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
