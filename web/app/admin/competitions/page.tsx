import { redirect } from "next/navigation";

export default function AdminCompetitionsRedirectPage() {
  redirect("/admin/hackathons");
}
