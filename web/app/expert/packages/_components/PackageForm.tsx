"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ServiceOption {
  id: string;
  name: string;
  type: string;
  durationMinutes: number | null;
  price: number;
}

interface PackageItemInput {
  serviceId: string;
  quantity: string;
}

interface PackageFormProps {
  expertProfileId: string;
  services: ServiceOption[];
  initial?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    validityDays: number;
    items: { serviceId: string; quantity: number }[];
  };
}

export default function PackageForm({ expertProfileId, services, initial }: PackageFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial ? (initial.price / 100).toFixed(2) : "");
  const [validityDays, setValidityDays] = useState(initial?.validityDays.toString() || "30");
  const [items, setItems] = useState<PackageItemInput[]>(
    initial?.items.length
      ? initial.items.map((i) => ({ serviceId: i.serviceId, quantity: String(i.quantity) }))
      : [{ serviceId: "", quantity: "1" }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addItem() {
    setItems((prev) => [...prev, { serviceId: "", quantity: "1" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof PackageItemInput, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payloadItems = items
      .map((item) => ({ serviceId: item.serviceId, quantity: Number(item.quantity) }))
      .filter((item) => item.serviceId && item.quantity > 0);

    if (payloadItems.length === 0) {
      setError("Add at least one service item.");
      setLoading(false);
      return;
    }

    const payload = {
      expertProfileId,
      name: name.trim(),
      description: description.trim(),
      price: Math.round(Number(price) * 100),
      validityDays: Number(validityDays),
      items: payloadItems,
    };

    try {
      const url = initial ? `/api/v1/packages/${initial.id}` : "/api/v1/packages";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || `Failed to ${initial ? "update" : "create"} package`);
        setLoading(false);
        return;
      }
      toast.success(initial ? "Package updated" : "Package created");
      router.push("/expert/packages");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Career Kickstart Bundle"
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this package include?"
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Price (₹)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Validity (days)</label>
          <input
            type="number"
            min={1}
            required
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal">Services</label>
          <button
            type="button"
            onClick={addItem}
            className="text-sm font-semibold text-orangeDeep hover:text-[#1740A8] transition"
          >
            + Add service
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid sm:grid-cols-[1fr,auto,auto] gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-inkSoft">Service</label>
              <select
                value={item.serviceId}
                onChange={(e) => updateItem(index, "serviceId", e.target.value)}
                required
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                    {service.durationMinutes ? ` · ${service.durationMinutes} min` : " · DM"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-inkSoft">Quantity</label>
              <input
                type="number"
                min={1}
                required
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                className="w-24 rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length === 1}
              className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-red-600 px-4 py-3 hover:bg-red-50 transition disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
      >
        {loading ? "Saving..." : initial ? "Update package" : "Create package"}
      </button>
    </form>
  );
}
