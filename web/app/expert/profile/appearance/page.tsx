"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/Button";

const SECTIONS = [
  { key: "cover", label: "Cover image" },
  { key: "profile", label: "Profile header" },
  { key: "about", label: "About" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "expertise", label: "Expertise" },
  { key: "services", label: "Services" },
  { key: "packages", label: "Packages" },
  { key: "testimonials", label: "Reviews" },
  { key: "availability", label: "Availability" },
];

type PageSettings = {
  accentColor?: string;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
};

export default function AppearancePage() {
  const [slug, setSlug] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [accentColor, setAccentColor] = useState<string>("#1D4ED8");
  const [sectionOrder, setSectionOrder] = useState<string[]>(SECTIONS.map((s) => s.key));
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([fetch("/api/v1/experts/page-settings"), fetch("/api/v1/experts/onboarding")])
      .then(async ([settingsRes, onboardingRes]) => {
        if (!settingsRes.ok || !onboardingRes.ok) throw new Error("Failed to load");
        const settings = (await settingsRes.json()) as {
          coverImage?: string | null;
          pageSettings?: PageSettings | null;
        };
        const onboarding = (await onboardingRes.json()) as {
          profile?: { slug?: string | null } | null;
        };

        setSlug(onboarding.profile?.slug || "");
        setCoverImage(settings.coverImage || "");

        const pageSettings = settings.pageSettings || {};
        setAccentColor(pageSettings.accentColor || "#1D4ED8");
        if (pageSettings.sectionOrder?.length) setSectionOrder(pageSettings.sectionOrder);
        setVisibility(pageSettings.sectionVisibility || {});
      })
      .catch(() => toast.error("Failed to load appearance settings"))
      .finally(() => setLoading(false));
  }, []);

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "profiles", filename: file.name, contentType: file.type }),
      });
      const data = (await presignRes.json()) as {
        key?: string;
        putUrl?: string;
        publicUrl?: string;
      };
      if (!presignRes.ok) throw new Error("Presign failed");

      if (data.putUrl?.startsWith("http")) {
        const uploadRes = await fetch(data.putUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!uploadRes.ok) throw new Error("Upload failed");
      } else if (data.putUrl) {
        const formData = new FormData();
        formData.append("key", data.key || "");
        formData.append("file", file);
        const uploadRes = await fetch(data.putUrl, { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Upload failed");
      }

      const url = data.publicUrl || "";
      setCoverImage(url);
      await saveSettings({ coverImage: url });
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function saveSettings(patch: Partial<{ coverImage: string; pageSettings: PageSettings }>) {
    try {
      const payload: { coverImage?: string; accentColor?: string; sectionOrder?: string[]; sectionVisibility?: Record<string, boolean> } =
        {};
      if (patch.coverImage !== undefined) payload.coverImage = patch.coverImage;
      if (patch.pageSettings) {
        payload.accentColor = patch.pageSettings.accentColor;
        payload.sectionOrder = patch.pageSettings.sectionOrder;
        payload.sectionVisibility = patch.pageSettings.sectionVisibility;
      }
      const res = await fetch("/api/v1/experts/page-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      toast.error("Failed to save settings");
    }
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSectionOrder((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      saveSettings({ pageSettings: { accentColor, sectionOrder: next, sectionVisibility: visibility } });
      return next;
    });
  }

  function toggleSection(key: string) {
    setVisibility((prev) => {
      const next = { ...prev, [key]: prev[key] === false };
      saveSettings({ pageSettings: { accentColor, sectionOrder, sectionVisibility: next } });
      return next;
    });
  }

  function updateAccent(color: string) {
    setAccentColor(color);
    saveSettings({ pageSettings: { accentColor: color, sectionOrder, sectionVisibility: visibility } });
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
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">Page appearance</h1>
        <p className="text-inkSoft text-sm mt-1">Customise your public expert page sections, cover image, and accent colour.</p>
      </div>

      {/* Cover image */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-charcoal">Cover image</h2>
        <div className="relative w-full h-40 sm:h-56 rounded-2xl bg-cream overflow-hidden border border-charcoal/8">
          {coverImage ? (
            <Image src={coverImage} alt="Cover" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-inkSoft text-sm">No cover image</div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
        />
        <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : coverImage ? "Change cover" : "Upload cover"}
        </Button>
      </div>

      {/* Accent colour */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-charcoal">Accent colour</h2>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => updateAccent(e.target.value)}
            className="w-12 h-12 rounded-xl border border-charcoal/8 cursor-pointer"
          />
          <input
            type="text"
            value={accentColor}
            onChange={(e) => updateAccent(e.target.value)}
            className="flex-1 rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-charcoal">Sections</h2>
        <p className="text-inkSoft text-sm">Show, hide, and reorder the sections on your public page.</p>
        <div className="space-y-2">
          {sectionOrder.map((key, index) => {
            const section = SECTIONS.find((s) => s.key === key) || { key, label: key };
            const visible = visibility[key] !== false;
            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                  visible ? "border-charcoal/8 bg-cream" : "border-charcoal/8 bg-white opacity-60"
                }`}
              >
                <span className="font-semibold text-charcoal text-sm">{section.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    className="w-8 h-8 rounded-lg bg-white border border-charcoal/8 text-charcoal hover:border-charcoal disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, 1)}
                    disabled={index === sectionOrder.length - 1}
                    className="w-8 h-8 rounded-lg bg-white border border-charcoal/8 text-charcoal hover:border-charcoal disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSection(key)}
                    className={`w-16 h-8 rounded-lg text-xs font-semibold transition ${
                      visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {visible ? "Shown" : "Hidden"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6">
        <h2 className="font-display font-bold text-lg text-charcoal mb-2">Preview</h2>
        {slug ? (
          <Link
            href={`/expert/${slug}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
          >
            Open public page →
          </Link>
        ) : (
          <p className="text-inkSoft text-sm">Complete onboarding to preview your public page.</p>
        )}
      </div>
    </div>
  );
}
