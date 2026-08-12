"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { DocumentUpload } from "./_components/DocumentUpload";

export default function ExpertVerificationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    educationProof: "",
    employmentProof: "",
    linkedInUrl: "",
    resumeUrl: "",
    supportingDocs: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/expert-verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          supportingDocs: formData.supportingDocs,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to submit verification");
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function addSupportingDoc(url: string) {
    setFormData((prev) => ({ ...prev, supportingDocs: [...prev.supportingDocs, url] }));
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Eyebrow>Expert verification</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-2">
            Verify your credentials
          </h1>
          <p className="text-inkSoft mb-8">
            Submit documents so the Embark team can verify your profile. Your profile will remain private until approved.
          </p>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <DocumentUpload
              label="Education proof"
              value={formData.educationProof}
              onChange={(url) => setFormData((prev) => ({ ...prev, educationProof: url }))}
            />
            <DocumentUpload
              label="Employment proof"
              value={formData.employmentProof}
              onChange={(url) => setFormData((prev) => ({ ...prev, employmentProof: url }))}
            />
            <DocumentUpload
              label="Resume / CV"
              value={formData.resumeUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, resumeUrl: url }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-charcoal">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedInUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, linkedInUrl: e.target.value }))}
                className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
              />
            </div>

            <div className="border-t border-charcoal/8 pt-6">
              <h3 className="text-sm font-semibold text-charcoal mb-3">Supporting documents</h3>
              {formData.supportingDocs.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-orange hover:underline mb-1"
                >
                  Document {i + 1}
                </a>
              ))}
              <DocumentUpload
                label="Add supporting document"
                value=""
                onChange={addSupportingDoc}
              />
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit for verification"}
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
