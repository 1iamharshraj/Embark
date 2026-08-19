"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface ServiceItem {
  id: string;
  name: string;
  type: string;
  durationMinutes: number | null;
  price: number;
  status: string;
}

const tabs = [
  { key: "all", label: "All" },
  { key: "one_on_one", label: "1:1 Sessions" },
  { key: "priority_dm", label: "Priority DM" },
];

const statusBadge: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { label: "Published", className: "bg-green-100 text-green-700" },
  PAUSED: { label: "Paused", className: "bg-yellow-100 text-yellow-700" },
  ARCHIVED: { label: "Archived", className: "bg-red-100 text-red-700" },
};

export default function ServicesListClient({ services: initial }: { services: ServiceItem[] }) {
  const [services, setServices] = useState<ServiceItem[]>(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("one_on_one");

  const filtered = services.filter((service) => {
    if (activeTab === "all") return true;
    return service.type === activeTab.toUpperCase();
  });

  async function changeStatus(service: ServiceItem, nextStatus: string) {
    setLoadingId(service.id);
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, status: nextStatus } : s))
    );

    try {
      const res = await fetch(`/api/v1/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update service");
      toast.success(`Service ${nextStatus.toLowerCase()}`);
    } catch (err) {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, status: service.status } : s))
      );
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  async function duplicateService(service: ServiceItem) {
    setLoadingId(service.id);
    try {
      const res = await fetch(`/api/v1/services/${service.id}/duplicate`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to duplicate service");
      setServices((prev) => [json.service, ...prev]);
      toast.success("Service duplicated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteService(service: ServiceItem) {
    if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setLoadingId(service.id);
    try {
      const res = await fetch(`/api/v1/services/${service.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to delete service");
      }
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      toast.success("Service deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-orangeDeep">Marketplace</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Your services</h1>
        </div>
        <Link
          href="/expert/services/new"
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition"
        >
          + New service
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
          <p className="text-inkSoft mb-6">
            You haven&apos;t created any {activeTab === "all" ? "" : `${tabs.find(t => t.key === activeTab)?.label.toLowerCase()} `}services yet.
          </p>
          <Link
            href="/expert/services/new"
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition"
          >
            Create a service
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((service) => {
            const badge = statusBadge[service.status] || { label: service.status, className: "bg-gray-100 text-gray-600" };
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-charcoal uppercase">
                      {service.type.replace("_", " ")}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <h2 className="font-display font-semibold text-xl text-charcoal">{service.name}</h2>
                  <p className="text-sm text-inkSoft mt-1">
                    {service.durationMinutes ? `${service.durationMinutes} min` : "DM"} · ₹
                    {(service.price / 100).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {service.status !== "PUBLISHED" && service.status !== "ARCHIVED" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(service, "PUBLISHED")}
                      disabled={loadingId === service.id}
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-4 py-2 hover:bg-[#1740A8] transition disabled:opacity-60 text-sm"
                    >
                      Publish
                    </button>
                  )}
                  {service.status === "PUBLISHED" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(service, "PAUSED")}
                      disabled={loadingId === service.id}
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-4 py-2 hover:bg-orange/10 transition disabled:opacity-60 text-sm"
                    >
                      Pause
                    </button>
                  )}
                  {service.status !== "ARCHIVED" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(service, "ARCHIVED")}
                      disabled={loadingId === service.id}
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-4 py-2 hover:bg-orange/10 transition disabled:opacity-60 text-sm"
                    >
                      Archive
                    </button>
                  )}
                  {service.status === "ARCHIVED" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(service, "DRAFT")}
                      disabled={loadingId === service.id}
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-4 py-2 hover:bg-orange/10 transition disabled:opacity-60 text-sm"
                    >
                      Unarchive
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => duplicateService(service)}
                    disabled={loadingId === service.id}
                    className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-4 py-2 hover:bg-orange/10 transition disabled:opacity-60 text-sm"
                  >
                    Duplicate
                  </button>
                  <Link
                    href={`/expert/services/${service.id}/edit`}
                    className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal px-4 py-2 hover:bg-orange/10 transition text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteService(service)}
                    disabled={loadingId === service.id}
                    className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-red-600 px-4 py-2 hover:bg-red-50 transition disabled:opacity-60 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
