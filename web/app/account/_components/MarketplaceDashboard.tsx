import Link from "next/link";

interface Booking {
  id: string;
  status: string;
  scheduledAt: Date;
  service: { name: string; durationMinutes: number | null };
  expert: { name: string };
}

interface DM {
  id: string;
  status: string;
  title: string;
  expert: { name: string };
}

interface Purchase {
  id: string;
  status: string;
  validUntil: Date;
  package: { name: string };
}

interface MarketplaceDashboardProps {
  bookings: Booking[];
  dms: DM[];
  purchases: Purchase[];
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "bg-orangeSoft text-orangeDeep",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    ACTIVE: "bg-green-100 text-green-700",
    EXPIRED: "bg-gray-100 text-gray-600",
  };
  return map[status] || "bg-cream text-charcoal";
}

export default function MarketplaceDashboard({ bookings, dms, purchases }: MarketplaceDashboardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-charcoal mb-1">Marketplace</h2>
          <p className="text-inkSoft text-sm">Your bookings, priority DMs, and packages.</p>
        </div>
        <Link
          href="/experts"
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
        >
          Find experts
        </Link>
      </div>

      <div>
        <h3 className="font-display font-semibold text-lg text-charcoal mb-3">Upcoming bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-inkSoft text-sm">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-charcoal">{booking.service.name}</p>
                    <p className="text-sm text-inkSoft">
                      {new Date(booking.scheduledAt).toLocaleString()} · {booking.expert.name}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${statusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display font-semibold text-lg text-charcoal mb-3">Priority DMs</h3>
        {dms.length === 0 ? (
          <p className="text-inkSoft text-sm">No priority DMs yet.</p>
        ) : (
          <div className="space-y-3">
            {dms.slice(0, 5).map((dm) => (
              <Link
                key={dm.id}
                href={`/priority-dms/${dm.id}`}
                className="block rounded-xl bg-cream p-4 hover:bg-orange/5 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-charcoal">{dm.title}</p>
                    <p className="text-sm text-inkSoft">{dm.expert.name}</p>
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${statusClass(dm.status)}`}>
                    {dm.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display font-semibold text-lg text-charcoal mb-3">Package purchases</h3>
        {purchases.length === 0 ? (
          <p className="text-inkSoft text-sm">No packages purchased yet.</p>
        ) : (
          <div className="space-y-3">
            {purchases.slice(0, 5).map((purchase) => (
              <div
                key={purchase.id}
                className="rounded-xl bg-cream p-4 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-charcoal">{purchase.package.name}</p>
                  <p className="text-sm text-inkSoft">Valid until {new Date(purchase.validUntil).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${statusClass(purchase.status)}`}>
                  {purchase.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
