import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import MentorshipPageClient from "@/components/MentorshipPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentorship — Embark India",
  description: "Book 1:1 mentorship sessions with verified MBA alumni and industry professionals.",
};

export default async function MentorshipPage() {
  const experts = await prisma.expertProfile.findMany({
    where: {
      verificationStatus: "VERIFIED",
      isPublic: true,
    },
    include: { user: true },
    orderBy: { rating: "desc" },
  });

  const serializable = experts.map((e) => ({
    id: e.id,
    slug: e.slug,
    name: e.user.name,
    image: e.image ?? "",
    role: e.currentRole ?? "",
    company: e.currentCompany ?? "",
    college: e.bSchool ?? "",
    batch: e.batch ?? "",
    tier: e.yearsExperience && e.yearsExperience <= 3 ? "alumni" : "industry",
    phases: e.phases,
    streams: e.streams,
    rating: e.rating,
    sessions: e.sessions,
    years: e.yearsExperience ?? 0,
    price: e.price,
    guestLectures: e.guestLectures,
    expertise: e.expertise,
    bio: e.bio ?? "",
    reviewText: e.reviewText ?? "",
    reviewWho: e.reviewWho ?? "",
  }));

  return <MentorshipPageClient mentors={serializable} />;
}
