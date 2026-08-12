"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ServiceFormProps {
  expertProfileId: string;
  initial?: {
    id: string;
    type: string;
    name: string;
    description?: string;
    category?: string;
    durationMinutes?: number;
    price: number;
    bufferMinutes?: number;
    cancellationPolicy?: string;
    intakeQuestions: string[];
    meetingMethod?: string;
    isActive?: boolean;
  };
}

export default function ServiceForm({ expertProfileId, initial }: ServiceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: initial?.type || "ONE_ON_ONE",
    name: initial?.name || "",
    description: initial?.description || "",
    category: initial?.category || "",
    durationMinutes: initial?.durationMinutes?.toString() || "60",
    price: (initial?.price ? initial.price / 100 : 0).toString(),
    bufferMinutes: initial?.bufferMinutes?.toString() || "0",
    cancellationPolicy: initial?.cancellationPolicy || "",
    intakeQuestions: initial?.intakeQuestions?.join("\n") || "",
    meetingMethod: initial?.meetingMethod || "GOOGLE_MEET",
    isActive: initial?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      expertProfileId,
      type: formData.type,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      durationMinutes: Number(formData.durationMinutes),
      price: Math.round(Number(formData.price) * 100),
      bufferMinutes: Number(formData.bufferMinutes),
      cancellationPolicy: formData.cancellationPolicy,
      intakeQuestions: formData.intakeQuestions
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean),
      meetingMethod: formData.meetingMethod,
      isActive: formData.isActive,
    };

    try {
      const url = initial ? `/api/v1/services/${initial.id}` : "/api/v1/services";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to save service");
        setLoading(false);
        return;
      }
      toast.success(initial ? "Service updated" : "Service created");
      router.push("/expert/services");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function update(name: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Service type</label>
          <select
            value={formData.type}
            onChange={(e) => update("type", e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
          >
            <option value="ONE_ON_ONE">1:1 session</option>
            <option value="PRIORITY_DM">Priority DM</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="e.g. Marketing, Finance"
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Description</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Duration (min)</label>
          <input
            type="number"
            min={1}
            value={formData.durationMinutes}
            onChange={(e) => update("durationMinutes", e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Price (₹)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={formData.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Buffer (min)</label>
          <input
            type="number"
            min={0}
            value={formData.bufferMinutes}
            onChange={(e) => update("bufferMinutes", e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Meeting method</label>
          <select
            value={formData.meetingMethod}
            onChange={(e) => update("meetingMethod", e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
          >
            <option value="GOOGLE_MEET">Google Meet</option>
            <option value="ZOOM">Zoom</option>
            <option value="PHONE">Phone</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Cancellation policy</label>
          <input
            type="text"
            value={formData.cancellationPolicy}
            onChange={(e) => update("cancellationPolicy", e.target.value)}
            placeholder="e.g. 24 hours notice"
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Intake questions (one per line)</label>
        <textarea
          rows={4}
          value={formData.intakeQuestions}
          onChange={(e) => update("intakeQuestions", e.target.value)}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-cream border border-transparent px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          className="rounded"
        />
        <span className="text-sm text-charcoal">Active and visible to students</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
      >
        {loading ? "Saving..." : initial ? "Update service" : "Create service"}
      </button>
    </form>
  );
}
