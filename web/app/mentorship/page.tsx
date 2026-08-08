import { prisma } from "@/lib/prisma";
import MentorshipPageClient from "@/components/MentorshipPageClient";

export default async function MentorshipPage() {
  const mentors = await prisma.mentor.findMany({
    orderBy: { rating: "desc" },
  });

  const serializable = mentors.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    image: m.image,
    role: m.role,
    company: m.company,
    college: m.college,
    batch: m.batch,
    tier: m.tier,
    phases: m.phases,
    streams: m.streams,
    rating: m.rating,
    sessions: m.sessions,
    years: m.years,
    price: m.price,
    guestLectures: m.guestLectures,
    expertise: m.expertise,
    bio: m.bio,
    reviewText: m.reviewText,
    reviewWho: m.reviewWho,
  }));

  return <MentorshipPageClient mentors={serializable} />;
}
