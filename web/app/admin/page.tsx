import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";

const adminLinks = [
  { href: "/admin/competitions", label: "Manage competitions", desc: "Create, edit and publish case competitions." },
  { href: "/admin/playbooks", label: "Manage playbooks", desc: "Update stream playbooks and pricing." },
  { href: "/admin/mentors", label: "Manage mentors", desc: "Add or edit mentor profiles and availability." },
  { href: "/admin/speakers", label: "Speaker applications", desc: "Review and approve guest speaker applications." },
  { href: "/admin/lectures", label: "Lecture requests", desc: "Review guest lecture requests from institutes." },
  { href: "/admin/orders", label: "Orders", desc: "View playbook and mentorship orders." },
];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    redirect("/account");
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <Eyebrow>Organiser dashboard</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
              Admin centre
            </h1>
            <p className="text-inkSoft">
              Manage competitions, content, mentors, and inbound requests.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block bg-white rounded-2xl border border-charcoal/8 p-6 hover:border-orange/40 hover:shadow-[0_8px_24px_rgba(22,22,22,0.08)] transition"
              >
                <h2 className="font-display font-bold text-lg text-charcoal group-hover:text-orangeDeep transition mb-1">
                  {link.label}
                </h2>
                <p className="text-sm text-inkSoft">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
