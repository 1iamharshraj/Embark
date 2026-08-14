import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MentorProfileClient from "@/components/MentorProfileClient";

export default async function MentorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const expert = await prisma.expertProfile.findUnique({
    where: { slug: params.slug },
    include: { user: true },
  });

  if (!expert) {
    notFound();
  }

  const serializable = {
    slug: expert.slug,
    name: expert.user.name,
    image: expert.image ?? "",
    role: expert.currentRole ?? "",
    company: expert.currentCompany ?? "",
    college: expert.bSchool ?? "",
    batch: expert.batch ?? "",
    rating: expert.rating,
    sessions: expert.sessions,
    years: expert.yearsExperience ?? 0,
    price: expert.price,
    guestLectures: expert.guestLectures,
    expertise: expert.expertise,
    streams: expert.streams,
    phases: expert.phases,
    bio: expert.bio ?? "",
    reviewText: expert.reviewText ?? "",
    reviewWho: expert.reviewWho ?? "",
  };

  return <MentorProfileClient mentor={serializable} />;
}
