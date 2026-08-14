import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Button from "@/components/Button";
import ClientDate from "@/components/ClientDate";
import { ProfileForm } from "./_components/ProfileForm";
import { PasswordForm } from "./_components/PasswordForm";
import MarketplaceDashboard from "./_components/MarketplaceDashboard";

function compStatus(now: Date, regOpen: Date, regClose: Date, endAt: Date) {
  if (now < regOpen) return "Upcoming";
  if (now >= regOpen && now <= regClose) return "Live";
  if (now > regClose && now < endAt) return "Running";
  return "Closed";
}

function sectionCard(children: React.ReactNode, className = "") {
  return (
    <div
      className={`bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

const icons = {
  competitions: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  hackathons: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  bookings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true, expertProfile: true },
  });

  if (!user) {
    redirect("/login");
  }

  const [registrations, hackathonRegistrations, orders, bookings, dms, purchases] = await Promise.all([
    prisma.registration.findMany({
      where: { userId: user.id },
      include: { competition: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.hackathonRegistration.findMany({
      where: { userId: user.id },
      include: { hackathon: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { userId: user.id, status: "paid" },
      include: { playbook: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { clientId: user.id },
      include: {
        service: { select: { name: true, durationMinutes: true } },
        expert: { select: { name: true } },
      },
      orderBy: { scheduledAt: "desc" },
      take: 5,
    }),
    prisma.priorityDM.findMany({
      where: { studentId: user.id },
      include: { expert: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.packagePurchase.findMany({
      where: { studentId: user.id },
      include: { package: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = {
    competitions: registrations.length,
    hackathons: hackathonRegistrations.length,
    orders: orders.length,
    bookings: bookings.length,
  };

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orangeDeep uppercase tracking-wider">Your account</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-1">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-inkSoft mt-1">Manage your profile, registrations and purchases.</p>
        </div>
        {user.isAdmin && (
          <Button href="/admin" variant="primary">
            Admin centre
          </Button>
        )}
      </div>

      {/* Profile card */}
      {sectionCard(
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            <div className="w-28 h-28 rounded-full bg-cream overflow-hidden border border-charcoal/8 relative">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-inkSoft font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-2xl text-charcoal">{user.name}</h2>
            <p className="text-inkSoft">{user.email}</p>
            <p className="text-sm text-inkSoft mt-1">
              Member since{" "}
              <ClientDate date={user.createdAt} options={{ year: "numeric", month: "long" }} />
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button href="/account/profile" variant="primary" size="sm">
                Edit profile
              </Button>
              <Button href="/account/orders" variant="ghost" size="sm">
                My orders
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Competitions", value: stats.competitions, href: "/account#competitions", icon: icons.competitions },
          { label: "Hackathons", value: stats.hackathons, href: "/account#hackathons", icon: icons.hackathons },
          { label: "Orders", value: stats.orders, href: "/account/orders", icon: icons.orders },
          { label: "Bookings", value: stats.bookings, href: "/account/mentorship", icon: icons.bookings },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-white rounded-2xl border border-charcoal/8 p-5 hover:border-orange/40 hover:shadow-[0_8px_24px_rgba(22,22,22,0.08)] transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-inkSoft text-sm font-medium">{stat.label}</p>
                <p className="font-display font-bold text-3xl text-charcoal mt-1">{stat.value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-orangeSoft text-orangeDeep flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8">
        {/* Left column */}
        <div className="space-y-8">
          {/* Profile form */}
          {sectionCard(
            <>
              <h2 className="font-display font-bold text-xl text-charcoal mb-1">Profile details</h2>
              <p className="text-inkSoft text-sm mb-5">Update your name and contact details.</p>
              <ProfileForm
                initial={{
                  name: user.name,
                  phone: user.phone || "",
                  image: user.image || "",
                  bio: user.studentProfile?.bio || "",
                  location: user.studentProfile?.location || "",
                  linkedIn: user.studentProfile?.linkedIn || "",
                  website: user.studentProfile?.website || "",
                  isPublic: user.studentProfile?.isPublic ?? true,
                }}
                email={user.email}
              />
            </>
          )}

          {/* Password */}
          {sectionCard(
            <>
              <h2 className="font-display font-bold text-xl text-charcoal mb-1">Change password</h2>
              <p className="text-inkSoft text-sm mb-5">Update your password to keep your account secure.</p>
              <PasswordForm />
            </>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Marketplace */}
          <MarketplaceDashboard bookings={bookings} dms={dms} purchases={purchases} />

          {/* My orders */}
          {sectionCard(
            <>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-charcoal">Recent orders</h2>
                  <p className="text-inkSoft text-sm">Playbooks and sessions you have purchased.</p>
                </div>
                <Button href="/account/orders" size="sm" variant="ghost">
                  View all
                </Button>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-8 bg-cream rounded-2xl">
                  <p className="text-inkSoft mb-4">No orders yet.</p>
                  <Button href="/playbooks" size="sm">
                    Browse playbooks
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={order.playbook ? `/playbook/${order.playbook.slug}` : "/account/orders"}
                      className="flex items-center justify-between gap-3 rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
                    >
                      <div>
                        <p className="font-semibold text-charcoal">{order.playbook?.name || "Order"}</p>
                        <p className="text-xs text-inkSoft capitalize">{order.type}</p>
                      </div>
                      <span className="text-sm font-semibold text-charcoal">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>,
            "overflow-hidden"
          )}

          {/* My hackathons */}
          {sectionCard(
            <>
              <h2 className="font-display font-bold text-xl text-charcoal mb-5">My hackathons</h2>
              {hackathonRegistrations.length === 0 ? (
                <div className="text-center py-8 bg-cream rounded-2xl">
                  <p className="text-inkSoft mb-4">No hackathon registrations yet.</p>
                  <Button href="/hackathons" size="sm">
                    Explore hackathons
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {hackathonRegistrations.map((reg) => (
                    <Link
                      key={reg.id}
                      href={`/hackathon/${reg.hackathon.slug}`}
                      className="group block rounded-2xl border border-charcoal/8 bg-cream p-5 hover:border-orange/40 transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-inkSoft">
                          {reg.hackathon.category || "Hackathon"}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 bg-green-100 text-green-700">
                          {reg.status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-charcoal group-hover:text-orangeDeep transition">
                        {reg.hackathon.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* My competitions */}
          {sectionCard(
            <>
              <h2 className="font-display font-bold text-xl text-charcoal mb-5">My competitions</h2>
              {registrations.length === 0 ? (
                <div className="text-center py-8 bg-cream rounded-2xl">
                  <p className="text-inkSoft mb-4">No competition registrations yet.</p>
                  <Button href="/competitions" size="sm">
                    Explore competitions
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
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
                        <h3 className="font-display font-bold text-lg text-charcoal group-hover:text-orangeDeep transition">
                          {reg.competition.title}
                        </h3>
                        {reg.teamName && <p className="text-sm text-inkSoft mt-1">Team: {reg.teamName}</p>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
