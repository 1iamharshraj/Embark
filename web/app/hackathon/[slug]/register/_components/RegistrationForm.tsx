"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

interface Member {
  name: string;
  email: string;
}

interface RegistrationFormProps {
  hackathon: {
    id: string;
    slug: string;
    title: string;
    participationMode: string;
    teamMin: number;
    teamMax: number;
    fee: number;
    registrationOpen: boolean;
  };
  existing: boolean;
}

export default function RegistrationForm({ hackathon, existing }: RegistrationFormProps) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([{ name: "", email: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (existing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 text-center">
        <p className="text-charcoal font-semibold mb-2">You are already registered!</p>
        <Link href={`/hackathon/${hackathon.slug}`} className="text-orangeDeep font-semibold hover:underline">
          Back to hackathon
        </Link>
      </div>
    );
  }

  if (!hackathon.registrationOpen) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 text-center">
        <p className="text-charcoal font-semibold mb-2">Registration is currently closed.</p>
        <Link href={`/hackathon/${hackathon.slug}`} className="text-orangeDeep font-semibold hover:underline">
          Back to hackathon
        </Link>
      </div>
    );
  }

  const isTeam = hackathon.participationMode === "TEAM";

  function addMember() {
    if (members.length < hackathon.teamMax - 1) {
      setMembers([...members, { name: "", email: "" }]);
    }
  }

  function updateMember(index: number, field: keyof Member, value: string) {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  }

  function removeMember(index: number) {
    setMembers(members.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: Record<string, unknown> = {};
    if (isTeam) {
      payload.teamName = teamName.trim();
      payload.members = members.filter((m) => m.email.trim()).map((m) => ({ name: m.name.trim(), email: m.email.trim().toLowerCase() }));
    }

    const res = await fetch(`/api/v1/hackathons/${hackathon.slug}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.message || "Registration failed");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 text-center">
        <p className="text-charcoal font-semibold mb-2">Registered successfully!</p>
        <p className="text-inkSoft text-sm mb-4">
          {isTeam
            ? "Your team has been created. Invite emails will be sent to your members."
            : "You can now submit your solution when the submission phase opens."}
        </p>
        <Link href={`/hackathon/${hackathon.slug}`} className="text-orangeDeep font-semibold hover:underline">
          Back to hackathon
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8 space-y-6">
      {isTeam && (
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Team name</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
            required
          />
        </div>
      )}

      {isTeam && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-charcoal">Team members</label>
            <span className="text-xs text-inkSoft">
              {members.length + 1} of {hackathon.teamMax}
            </span>
          </div>
          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-3 items-end border border-charcoal/8 rounded-xl p-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Name</label>
                  <input
                    value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                    className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-charcoal mb-1">Email</label>
                    <input
                      type="email"
                      value={m.email}
                      onChange={(e) => updateMember(i, "email", e.target.value)}
                      className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    className="text-red-600 text-sm font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {members.length < hackathon.teamMax - 1 && (
            <button
              type="button"
              onClick={addMember}
              className="mt-3 text-sm font-semibold text-orangeDeep hover:underline"
            >
              + Add member
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-50"
        >
          {loading ? "Registering…" : hackathon.fee > 0 ? `Pay & register ₹${hackathon.fee}` : "Register for free"}
        </button>
        <Button href={`/hackathon/${hackathon.slug}`} variant="ghost" size="sm">
          Cancel
        </Button>
      </div>
    </form>
  );
}
