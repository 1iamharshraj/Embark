import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import ClientDate from "@/components/ClientDate";

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!expertProfile) redirect("/expert/onboarding");

  const [bookings, dms, purchases] = await Promise.all([
    prisma.booking.findMany({
      where: { expertId: session.user.id },
      include: { client: { include: { studentProfile: true } }, service: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.priorityDM.findMany({
      where: { expertId: session.user.id },
      include: { student: { include: { studentProfile: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.packagePurchase.findMany({
      where: { package: { expertProfileId: expertProfile.id } },
      include: { student: { include: { studentProfile: true } }, package: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const customers = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      college: string | null;
      sessions: number;
      dms: number;
      totalSpent: number;
      lastInteraction: Date | null;
      currentPackage: string | null;
    }
  >();

  function ensure(userId: string, name: string, email: string, college: string | null) {
    if (!customers.has(userId)) {
      customers.set(userId, {
        id: userId,
        name,
        email,
        college,
        sessions: 0,
        dms: 0,
        totalSpent: 0,
        lastInteraction: null,
        currentPackage: null,
      });
    }
    return customers.get(userId)!;
  }

  for (const booking of bookings) {
    const c = ensure(booking.clientId, booking.client.name, booking.client.email, booking.client.studentProfile?.college ?? null);
    c.sessions += 1;
    c.totalSpent += booking.amount;
    if (!c.lastInteraction || booking.createdAt > c.lastInteraction) c.lastInteraction = booking.createdAt;
  }

  for (const dm of dms) {
    const c = ensure(dm.studentId, dm.student.name, dm.student.email, dm.student.studentProfile?.college ?? null);
    c.dms += 1;
    c.totalSpent += dm.amount;
    if (!c.lastInteraction || dm.createdAt > c.lastInteraction) c.lastInteraction = dm.createdAt;
  }

  for (const purchase of purchases) {
    const c = ensure(purchase.studentId, purchase.student.name, purchase.student.email, purchase.student.studentProfile?.college ?? null);
    c.totalSpent += purchase.amount;
    if (!c.lastInteraction || purchase.createdAt > c.lastInteraction) c.lastInteraction = purchase.createdAt;
    if (["ACTIVE", "PARTIALLY_USED"].includes(purchase.status)) {
      c.currentPackage = purchase.package.name;
    }
  }

  const list = Array.from(customers.values()).sort(
    (a, b) => (b.lastInteraction?.getTime() || 0) - (a.lastInteraction?.getTime() || 0)
  );

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          <Eyebrow>CRM</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-8">Your customers</h1>

          {list.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 text-center">
              <p className="text-inkSoft">No customers yet.</p>
              <p className="text-xs text-inkSoft/60 mt-1">
                Students who book sessions, send priority DMs, or buy packages will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] overflow-hidden">
              <div className="divide-y divide-charcoal/8">
                {list.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/expert/customers/${customer.id}`}
                    className="block p-5 sm:p-6 hover:bg-orange/5 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-charcoal">{customer.name}</p>
                        <p className="text-sm text-inkSoft">
                          {customer.email}
                          {customer.college && ` · ${customer.college}`}
                        </p>
                        {customer.currentPackage && (
                          <p className="text-xs text-orangeDeep mt-1">Current package: {customer.currentPackage}</p>
                        )}
                      </div>
                      <div className="text-sm text-inkSoft text-left sm:text-right">
                        <p>
                          {customer.sessions} session{customer.sessions === 1 ? "" : "s"} · {customer.dms} DM
                          {customer.dms === 1 ? "" : "s"}
                        </p>
                        <p className="font-semibold text-charcoal mt-0.5">
                          Total spent ₹{(customer.totalSpent / 100).toFixed(2)}
                        </p>
                        {customer.lastInteraction && (
                          <p className="text-xs mt-0.5">
                            Last interaction{" "}
                            <ClientDate date={customer.lastInteraction} options={{ dateStyle: "medium" }} />
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
