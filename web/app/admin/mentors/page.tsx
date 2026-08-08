import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Container from "@/components/Container";

export default async function AdminMentorsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/account");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-4">Manage mentors</h1>
          <p className="text-inkSoft">Mentor management tools coming in the next phase.</p>
        </div>
      </Container>
    </section>
  );
}
