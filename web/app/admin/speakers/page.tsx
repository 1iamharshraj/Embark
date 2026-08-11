import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import Container from "@/components/Container";

export default async function AdminSpeakersPage() {
  await checkPagePermission("speaker.view");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-4">Speaker applications</h1>
          <p className="text-inkSoft">Speaker application review tools coming in the next phase.</p>
        </div>
      </Container>
    </section>
  );
}
