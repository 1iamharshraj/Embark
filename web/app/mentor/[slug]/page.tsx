import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MentorProfileClient from "@/components/MentorProfileClient";

export default async function MentorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const mentor = await prisma.mentor.findUnique({
    where: { slug: params.slug },
  });

  if (!mentor) {
    notFound();
  }

  const serializable = {
    slug: mentor.slug,
    name: mentor.name,
    image: mentor.image,
    role: mentor.role,
    company: mentor.company,
    college: mentor.college,
    batch: mentor.batch,
    rating: mentor.rating,
    sessions: mentor.sessions,
    years: mentor.years,
    price: mentor.price,
    guestLectures: mentor.guestLectures,
    expertise: mentor.expertise,
    streams: mentor.streams,
    phases: mentor.phases,
    bio: mentor.bio,
    reviewText: mentor.reviewText,
    reviewWho: mentor.reviewWho,
  };

  return <MentorProfileClient mentor={serializable} />;
}
