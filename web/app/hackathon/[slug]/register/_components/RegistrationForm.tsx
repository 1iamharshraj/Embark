"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

interface Member {
  name: string;
  email: string;
}

interface RegistrationField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "url";
  required: boolean;
  options?: string[];
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
    customFields?: RegistrationField[];
  };
  existing: boolean;
  defaults?: {
    name?: string;
    email?: string;
    phone?: string | null;
    college?: string;
    course?: string;
    year?: number | null;
    specialization?: string;
    linkedIn?: string;
  };
}

export default function RegistrationForm({ hackathon, existing, defaults }: RegistrationFormProps) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([{ name: "", email: "" }]);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({
    name: defaults?.name || "",
    email: defaults?.email || "",
    phone: defaults?.phone || "",
    college: defaults?.college || "",
    course: defaults?.course || "",
    year: defaults?.year ? String(defaults.year) : "",
    specialization: defaults?.specialization || "",
    linkedIn: defaults?.linkedIn || "",
    resume: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isTeam = hackathon.participationMode === "TEAM";

  function updateField(key: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

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

  function validate(): string | null {
    const email = String(formData.email || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!String(formData.name || "").trim()) return "Please enter your name.";
    if (!String(formData.college || "").trim()) return "Please enter your college.";
    if (!String(formData.course || "").trim()) return "Please enter your course.";
    if (!String(formData.year || "").trim()) return "Please enter your year of study.";

    if (isTeam) {
      if (!teamName.trim()) return "Please enter a team name.";
      const totalSize = 1 + members.filter((m) => m.email.trim()).length;
      if (totalSize < hackathon.teamMin) return `Team must have at least ${hackathon.teamMin} members.`;
      if (totalSize > hackathon.teamMax) return `Team can have at most ${hackathon.teamMax} members.`;
    }

    for (const field of hackathon.customFields || []) {
      const value = formData[field.name];
      if (field.required && (value === undefined || value === "" || value === false)) {
        return `${field.label} is required.`;
      }
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      ...formData,
      year: Number(formData.year),
      customAnswers: hackathon.customFields?.reduce((acc, field) => {
        acc[field.name] = formData[field.name];
        return acc;
      }, {} as Record<string, string | boolean>),
    };

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

  const inputClass =
    "w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";
  const labelClass = "block text-sm font-semibold text-charcoal mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8 space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full name</label>
          <input value={String(formData.name)} onChange={(e) => updateField("name", e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={String(formData.email)}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input value={String(formData.phone)} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>LinkedIn URL</label>
          <input
            type="url"
            value={String(formData.linkedIn)}
            onChange={(e) => updateField("linkedIn", e.target.value)}
            className={inputClass}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div>
          <label className={labelClass}>College</label>
          <input value={String(formData.college)} onChange={(e) => updateField("college", e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Course</label>
          <input value={String(formData.course)} onChange={(e) => updateField("course", e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Year of study</label>
          <input
            type="number"
            min={1}
            value={String(formData.year)}
            onChange={(e) => updateField("year", e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Specialization</label>
          <input
            value={String(formData.specialization)}
            onChange={(e) => updateField("specialization", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Resume URL</label>
          <input
            type="url"
            value={String(formData.resume)}
            onChange={(e) => updateField("resume", e.target.value)}
            className={inputClass}
            placeholder="https://example.com/resume.pdf"
          />
        </div>
      </div>

      {hackathon.customFields && hackathon.customFields.length > 0 && (
        <div className="border-t border-charcoal/8 pt-6 space-y-4">
          <h3 className="font-semibold text-charcoal">Additional questions</h3>
          {hackathon.customFields.map((field) => (
            <div key={field.name}>
              <label className={labelClass}>
                {field.label}
                {field.required && <span className="text-red-600 ml-0.5">*</span>}
              </label>
              {field.type === "textarea" && (
                <textarea
                  value={String(formData[field.name] || "")}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  rows={3}
                  className={inputClass}
                  required={field.required}
                />
              )}
              {field.type === "select" && (
                <select
                  value={String(formData[field.name] || "")}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className={inputClass}
                  required={field.required}
                >
                  <option value="">Select</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}
              {field.type === "checkbox" && (
                <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData[field.name]}
                    onChange={(e) => updateField(field.name, e.target.checked)}
                    className="rounded border-charcoal/30 text-orangeDeep focus:ring-orange"
                  />
                  {field.label}
                </label>
              )}
              {!["textarea", "select", "checkbox"].includes(field.type) && (
                <input
                  type={field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
                  value={String(formData[field.name] || "")}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className={inputClass}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {isTeam && (
        <div className="border-t border-charcoal/8 pt-6 space-y-4">
          <div>
            <label className={labelClass}>Team name</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-charcoal">Team members</label>
              <span className="text-xs text-inkSoft">
                {1 + members.filter((m) => m.email.trim()).length} of {hackathon.teamMax}
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
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-charcoal mb-1">Email</label>
                      <input
                        type="email"
                        value={m.email}
                        onChange={(e) => updateMember(i, "email", e.target.value)}
                        className={inputClass}
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
