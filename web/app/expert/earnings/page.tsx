import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earnings — Expert hub",
};

const links = [
  { href: "/expert/earnings/revenue", label: "Revenue" },
  { href: "/expert/earnings/transactions", label: "Transactions" },
  { href: "/expert/earnings/pending", label: "Pending" },
  { href: "/expert/wallet", label: "Payouts / Wallet" },
];

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <p className="text-inkSoft text-sm">
        Track everything you have earned from sessions, packages, and priority DMs.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group bg-white rounded-2xl border border-charcoal/8 p-6 hover:border-orange/40 hover:shadow-[0_8px_24px_rgba(22,22,22,0.08)] transition"
          >
            <p className="font-semibold text-charcoal group-hover:text-orangeDeep transition">{link.label}</p>
            <p className="text-xs text-inkSoft mt-1">View {link.label.toLowerCase()} details →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
