import { redirect } from "next/navigation";

export default function CompetitionsIdRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/hackathon/${params.id}`);
}
