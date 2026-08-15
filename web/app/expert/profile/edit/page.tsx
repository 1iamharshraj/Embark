"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ExpertiseChips from "@/app/expert/onboarding/_components/ExpertiseChips";

export default function ExpertProfileEditPage() {
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [bSchool, setBSchool] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [linkedIn, setLinkedIn] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/experts/onboarding");
        const json = (await res.json()) as {
          profile?: {
            headline?: string | null;
            bio?: string | null;
            location?: string | null;
            currentRole?: string | null;
            currentCompany?: string | null;
            yearsExperience?: number | null;
            industry?: string | null;
            bSchool?: string | null;
            expertise?: string[];
            socialLinks?: { linkedIn?: string; twitter?: string; instagram?: string } | null;
          } | null;
        };
        const p = json.profile;
        if (p) {
          setHeadline(p.headline || "");
          setBio(p.bio || "");
          setLocation(p.location || "");
          setCurrentRole(p.currentRole || "");
          setCompany(p.currentCompany || "");
          setYearsExperience(p.yearsExperience?.toString() || "");
          setIndustry(p.industry || "");
          setBSchool(p.bSchool || "");
          setExpertise(Array.isArray(p.expertise) ? p.expertise : []);
          setLinkedIn(p.socialLinks?.linkedIn || "");
          setTwitter(p.socialLinks?.twitter || "");
          setInstagram(p.socialLinks?.instagram || "");
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/experts/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          location,
          currentRole,
          company,
          yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
          industry,
          bSchool,
          expertise,
          socialLinks: {
            linkedIn: linkedIn || undefined,
            twitter: twitter || undefined,
            instagram: instagram || undefined,
          },
        }),
      });
      if (res.ok) {
        toast.success("Profile saved");
      } else {
        const json = await res.json();
        toast.error(json.message || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Edit public profile</h1>
        <p className="text-inkSoft text-sm mt-1">Update the details students see on your public page.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Current role</label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Years of experience</label>
            <input
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Product Leader helping MBA students break into tech"
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Business school</label>
            <input
              type="text"
              value={bSchool}
              onChange={(e) => setBSchool(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-charcoal">Areas of expertise</label>
          <ExpertiseChips selected={expertise} onChange={setExpertise} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">LinkedIn</label>
            <input
              type="text"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-charcoal">Twitter</label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-charcoal">Instagram</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-3 hover:bg-[#1740A8] transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
