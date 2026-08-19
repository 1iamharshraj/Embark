"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type IntakeQuestion = {
  question: string;
  type: "text" | "long" | "dropdown" | "multi" | "file" | "url";
  options?: string[];
  required?: boolean;
};

interface ServiceFormProps {
  expertProfileId: string;
  initial?: {
    id: string;
    type: string;
    name: string;
    description?: string;
    category?: string;
    outcomes?: string[];
    durationMinutes?: number;
    price: number;
    bufferMinutes?: number;
    cancellationPolicy?: string;
    intakeQuestions: IntakeQuestion[];
    meetingMethod?: string;
    responseSlaHours?: number;
    status?: string;
    isActive?: boolean;
  };
}

const intakeTypeLabels: Record<IntakeQuestion["type"], string> = {
  text: "Short text",
  long: "Long text",
  dropdown: "Dropdown",
  multi: "Multiple choice",
  file: "File upload",
  url: "URL",
};

function deriveStatus(initial?: ServiceFormProps["initial"]): "DRAFT" | "PUBLISHED" | "PAUSED" | "ARCHIVED" {
  if (initial?.status) return initial.status as ReturnType<typeof deriveStatus>;
  return initial?.isActive ? "PUBLISHED" : "DRAFT";
}

export default function ServiceForm({ expertProfileId, initial }: ServiceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: initial?.type || "ONE_ON_ONE",
    name: initial?.name || "",
    description: initial?.description || "",
    category: initial?.category || "",
    outcomes: initial?.outcomes?.join("\n") || "",
    durationMinutes: initial?.durationMinutes?.toString() || "60",
    price: (initial?.price ? initial.price / 100 : 0).toString(),
    bufferMinutes: initial?.bufferMinutes?.toString() || "0",
    cancellationPolicy: initial?.cancellationPolicy || "",
    intakeQuestions: initial?.intakeQuestions ?? [],
    meetingMethod: initial?.meetingMethod || "GOOGLE_MEET",
    responseSlaHours: initial?.responseSlaHours?.toString() || "48",
    status: deriveStatus(initial),
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
      outcomes: formData.outcomes
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean),
      durationMinutes: Number(formData.durationMinutes),
      price: Math.round(Number(formData.price) * 100),
      bufferMinutes: Number(formData.bufferMinutes),
      cancellationPolicy: formData.cancellationPolicy,
      intakeQuestions: formData.intakeQuestions,
      meetingMethod: formData.meetingMethod,
      responseSlaHours: Number(formData.responseSlaHours),
      status: formData.status,
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

  function addQuestion() {
    setFormData((prev) => ({
      ...prev,
      intakeQuestions: [...prev.intakeQuestions, { question: "", type: "text", required: false }],
    }));
  }

  function updateQuestion(index: number, patch: Partial<IntakeQuestion>) {
    setFormData((prev) => ({
      ...prev,
      intakeQuestions: prev.intakeQuestions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }

  function removeQuestion(index: number) {
    setFormData((prev) => ({
      ...prev,
      intakeQuestions: prev.intakeQuestions.filter((_, i) => i !== index),
    }));
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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">What you&apos;ll get (one outcome per line)</label>
        <textarea
          rows={3}
          value={formData.outcomes}
          onChange={(e) => update("outcomes", e.target.value)}
          placeholder="e.g. Resume review&#10;e.g. Career roadmap&#10;e.g. Interview preparation"
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

      {formData.type === "PRIORITY_DM" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Response SLA</label>
          <select
            value={formData.responseSlaHours}
            onChange={(e) => update("responseSlaHours", e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
          >
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
            <option value="72">72 hours</option>
          </select>
          <p className="text-xs text-inkSoft">Deadline starts after the student pays.</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Status</label>
        <select
          value={formData.status}
          onChange={(e) => update("status", e.target.value)}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="PAUSED">Paused</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <p className="text-xs text-inkSoft">Only Published services are visible to students.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal">Intake questions</label>
          <button
            type="button"
            onClick={addQuestion}
            className="text-xs font-semibold text-orangeDeep hover:underline"
          >
            + Add question
          </button>
        </div>

        {formData.intakeQuestions.length === 0 && (
          <p className="text-xs text-inkSoft">No intake questions yet.</p>
        )}

        {formData.intakeQuestions.map((q, index) => (
          <div key={index} className="bg-cream rounded-xl p-4 space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal">Question</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(index, { question: e.target.value })}
                placeholder="What do you want to achieve?"
                className="w-full rounded-xl bg-white border border-transparent px-4 py-2.5 text-charcoal placeholder-inkSoft/50 focus:border-orange outline-none transition"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal">Type</label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(index, { type: e.target.value as IntakeQuestion["type"] })}
                  className="w-full rounded-xl bg-white border border-transparent px-4 py-2.5 text-charcoal focus:border-orange outline-none transition"
                >
                  {Object.entries(intakeTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-charcoal">
                  <input
                    type="checkbox"
                    checked={q.required ?? false}
                    onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                    className="rounded"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="ml-auto text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            {(q.type === "dropdown" || q.type === "multi") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal">Options (comma separated)</label>
                <input
                  type="text"
                  value={(q.options ?? []).join(", ")}
                  onChange={(e) =>
                    updateQuestion(index, {
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Option 1, Option 2, Option 3"
                  className="w-full rounded-xl bg-white border border-transparent px-4 py-2.5 text-charcoal placeholder-inkSoft/50 focus:border-orange outline-none transition"
                />
              </div>
            )}
          </div>
        ))}
      </div>

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
