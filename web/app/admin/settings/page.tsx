import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { checkPagePermission } from "@/lib/rbac";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import SettingsForm from "./_components/SettingsForm";

export default async function AdminSettingsPage() {
  await checkPagePermission("settings.view");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <Eyebrow>Configuration</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Platform settings</h1>
          <SettingsForm />
        </div>
      </Container>
    </section>
  );
}
