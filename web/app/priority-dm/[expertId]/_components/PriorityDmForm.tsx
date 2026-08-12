"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PriorityDmFormProps {
  expertId: string;
  price: number;
}

export default function PriorityDmForm({ expertId, price }: PriorityDmFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    question: "",
    context: "",
    attachments: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/priority-dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId,
          title: form.title,
          question: form.question,
          context: form.context,
          attachments: form.attachments,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to submit priority DM");
        setLoading(false);
        return;
      }
      toast.success("Priority DM submitted. Proceed to payment.");
      router.push(`/priority-dms/${json.dm.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function addAttachment(url: string) {
    setForm((prev) => ({ ...prev, attachments: [...prev.attachments, url] }));
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="rounded-xl bg-cream p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-charcoal">Priority DM fee</span>
        <span className="font-display font-bold text-charcoal">₹{(price / 100).toFixed(2)}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Career pivot to Product Management"
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Your question</label>
        <textarea
          rows={5}
          required
          value={form.question}
          onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
          placeholder="Describe what you need help with..."
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Context (optional)</label>
        <textarea
          rows={3}
          value={form.context}
          onChange={(e) => setForm((prev) => ({ ...prev, context: e.target.value }))}
          placeholder="Background, links, or anything the expert should know"
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">Attachments</label>
        {form.attachments.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noreferrer" className="text-sm text-orange hover:underline">
            Attachment {i + 1}
          </a>
        ))}
        <input
          type="url"
          placeholder="Paste a document URL and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              const url = target.value.trim();
              if (url) {
                addAttachment(url);
                target.value = "";
              }
            }
          }}
          className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit priority DM"}
      </button>
    </form>
  );
}
