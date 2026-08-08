import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { ProfileForm } from "./_components/ProfileForm";
import { PasswordForm } from "./_components/PasswordForm";

function compStatus(now: Date, regOpen: Date, regClose: Date, endAt: Date) {
  if (now < regOpen) return "Upcoming";
  if (now >= regOpen && now <= regClose) return "Live";
  if (now > regClose && now < endAt) return "Running";
  return "Closed";
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    include: { competition: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <Eyebrow>Your account</Eyebrow>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-inkSoft">
              Manage your profile, password, and competition registrations.
            </p>
          </div>

          {user.isAdmin && (
            <div className="mb-8 p-5 bg-navy rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg">Organiser access</h2>
                <p className="text-cream/70 text-sm">
                  You have admin privileges. Manage the platform from the admin dashboard.
                </p>
              </div>
              <Button href="/admin" variant="light">
                Go to admin
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { href: "/account", label: "Profile" },
              { href: "/account/orders", label: "Orders" },
              { href: "/account/mentorship", label: "Mentorship" },
              { href: "/account/requests", label: "Requests" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-white border border-charcoal/8 text-charcoal hover:border-orange/40 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-1">
                Profile details
              </h2>
              <p className="text-inkSoft text-sm mb-5">Update your name and college.</p>
              <ProfileForm
                initialName={user.name}
                initialCollege={user.college}
                email={user.email}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-charcoal mb-1">
                Change password
              </h2>
              <p className="text-inkSoft text-sm mb-5">
                Update your password to keep your account secure.
              </p>
              <PasswordForm />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
            <h2 className="font-display font-bold text-xl text-charcoal mb-5">
              My competitions
            </h2>

            {registrations.length === 0 ? (
              <div className="text-center py-10 bg-cream rounded-2xl">
                <p className="text-inkSoft mb-4">You haven&apos;t registered for any competitions yet.</p>
                <Button href="/competitions" size="sm">
                  Explore competitions
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {registrations.map((reg) => {
                  const status = compStatus(
                    now,
                    reg.competition.regOpen,
                    reg.competition.regClose,
                    reg.competition.endAt
                  );
                  return (
                    <Link
                      key={reg.id}
                      href={`/competition/${reg.compId}`}
                      className="group block rounded-2xl border border-charcoal/8 bg-cream p-5 hover:border-orange/40 transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-inkSoft">
                          {reg.competition.category}
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${
                            status === "Live"
                              ? "bg-green-100 text-green-700"
                              : status === "Upcoming"
                              ? "bg-orangeSoft text-orangeDeep"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-charcoal leading-tight group-hover:text-orangeDeep transition">
                        {reg.competition.title}
                      </h3>
                      {reg.teamName && (
                        <p className="text-sm text-inkSoft mt-1">Team: {reg.teamName}</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-charcoal mb-1">My orders</h2>
              <p className="text-inkSoft text-sm">View playbooks you have purchased and their payment status.</p>
            </div>
            <Button href="/account/orders" size="sm">
              View orders
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
