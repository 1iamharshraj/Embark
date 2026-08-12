import { redirect } from "next/navigation";

export default function CompetitionRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/hackathon/${params.id}`);
}
