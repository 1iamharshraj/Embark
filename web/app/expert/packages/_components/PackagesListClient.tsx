"use client";

import { useState } from "react";
import Link from "next/link";

interface PackageItem {
  id: string;
  name: string;
  price: number;
  validityDays: number;
  isActive: boolean;
  items: { quantity: number; service: { name: string } }[];
}

const tabs = [
  { key: "active", label: "Active" },
  { key: "drafts", label: "Drafts" },
  { key: "sold", label: "Sold" },
];

export default function PackagesListClient({ packages }: { packages: PackageItem[] }) {
  const [activeTab, setActiveTab] = useState("active");

  const filtered = packages.filter((pkg) => {
    switch (activeTab) {
      case "active":
        return pkg.isActive;
      case "drafts":
        return !pkg.isActive;
      case "sold":
        return false;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-orangeDeep">Marketplace</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Your packages</h1>
        </div>
        <Link
          href="/expert/packages/new"
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition"
        >
          + New package
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition ${
              activeTab === tab.key
                ? "bg-orangeDeep text-white"
                : "bg-white text-charcoal border border-charcoal/12 hover:border-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-8 text-center">
          <p className="text-inkSoft mb-2">No {activeTab} packages yet.</p>
          <p className="text-xs text-inkSoft/60">
            {activeTab === "sold"
              ? "Sold packages will appear once students start purchasing."
              : "Create a package to bundle your services."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {pkg.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                      Draft
                    </span>
                  )}
                </div>
                <h2 className="font-display font-semibold text-xl text-charcoal">{pkg.name}</h2>
                <p className="text-sm text-inkSoft mt-1">
                  ₹{(pkg.price / 100).toFixed(2)} · {pkg.validityDays} day
                  {pkg.validityDays === 1 ? "" : "s"} validity
                </p>
                <p className="text-sm text-inkSoft mt-1">
                  {pkg.items.map((item) => `${item.quantity}× ${item.service.name}`).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/expert/packages/${pkg.id}/edit`}
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-5 py-2.5 hover:bg-orange/10 transition"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
