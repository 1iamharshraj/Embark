import { checkPagePermission } from "@/lib/rbac";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import HackathonForm from "../_components/HackathonForm";

export default async function NewHackathonPage() {
  await checkPagePermission("hackathon.create");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Button href="/admin/hackathons" variant="ghost" size="sm">
            ← Back to hackathons
          </Button>
          <Eyebrow className="mt-4">New hackathon</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-6">Create hackathon</h1>
          <HackathonForm mode="create" submitUrl="/api/v1/admin/hackathons" />
        </div>
      </Container>
    </section>
  );
}
