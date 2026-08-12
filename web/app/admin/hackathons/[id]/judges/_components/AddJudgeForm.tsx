"use client";

import { useState } from "react";

export default function AddJudgeForm({ hackathonId }: { hackathonId: string }) {
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch(`/api/v1/admin/hackathons/${hackathonId}/judges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), bio: bio.trim() }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setEmail("");
      setBio("");
      setMessage("Judge added successfully.");
    } else {
      setMessage(data.message || "Failed to add judge");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-charcoal/8 p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Judge email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Bio / note</label>
          <input
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
          />
        </div>
      </div>
      {message && <p className={`text-sm ${message.includes("success") ? "text-green-700" : "text-red-600"}`}>{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add judge"}
      </button>
    </form>
  );
}
