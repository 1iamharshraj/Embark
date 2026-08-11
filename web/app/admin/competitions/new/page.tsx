import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import CompetitionForm from "../_components/CompetitionForm";

export default async function NewCompetitionPage() {
  await checkPagePermission("competition.create");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/competitions" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to competitions
          </Link>
          <Eyebrow>New competition</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Create a competition</h1>
          <CompetitionForm mode="create" submitUrl="/api/admin/competitions" />
        </div>
      </Container>
    </section>
  );
}
