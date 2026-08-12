"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StepProps {
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
}

interface FieldProps {
  label: string;
  name: string;
  value?: string;
  onChange: (name: string, value: string) => void;
  type?: string;
}

function TextField({ label, name, value, onChange, type = "text" }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange }: Omit<FieldProps, "type">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">{label}</label>
      <textarea
        rows={4}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
      />
    </div>
  );
}

function Step1({ formData, setFormData }: StepProps) {
  const update = (name: string, value: string) => setFormData({ ...formData, [name]: value });
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-charcoal">About you</h2>
      <TextField label="Professional headline" name="headline" value={formData.headline} onChange={update} />
      <TextArea label="Bio" name="bio" value={formData.bio} onChange={update} />
      <TextField label="Location" name="location" value={formData.location} onChange={update} />
    </div>
  );
}

function Step2({ formData, setFormData }: StepProps) {
  const update = (name: string, value: string) => setFormData({ ...formData, [name]: value });
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-charcoal">Education</h2>
      <TextField label="Business school" name="bSchool" value={formData.bSchool} onChange={update} />
      <TextField label="Degree" name="degree" value={formData.degree} onChange={update} />
      <TextField label="Specialization" name="specialization" value={formData.specialization} onChange={update} />
      <TextField label="Graduation year" name="graduationYear" value={formData.graduationYear} onChange={update} type="number" />
    </div>
  );
}

function Step3({ formData, setFormData }: StepProps) {
  const update = (name: string, value: string) => setFormData({ ...formData, [name]: value });
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-charcoal">Experience</h2>
      <TextField label="Current company" name="currentCompany" value={formData.currentCompany} onChange={update} />
      <TextField label="Current role" name="currentRole" value={formData.currentRole} onChange={update} />
      <TextField label="Previous companies (comma-separated)" name="previousCompanies" value={formData.previousCompanies} onChange={update} />
      <TextField label="Years of experience" name="yearsExperience" value={formData.yearsExperience} onChange={update} type="number" />
    </div>
  );
}

function Step4({ formData, setFormData }: StepProps) {
  const update = (name: string, value: string) => setFormData({ ...formData, [name]: value });
  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl text-charcoal">Expertise</h2>
      <TextField label="Industry" name="industry" value={formData.industry} onChange={update} />
      <TextField label="Function" name="function" value={formData.function} onChange={update} />
      <TextArea label="Areas of expertise (comma-separated)" name="expertise" value={formData.expertise} onChange={update} />
    </div>
  );
}

export default function ExpertOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({
    headline: "",
    bio: "",
    location: "",
    bSchool: "",
    degree: "",
    specialization: "",
    graduationYear: "",
    currentCompany: "",
    currentRole: "",
    previousCompanies: "",
    yearsExperience: "",
    industry: "",
    function: "",
    expertise: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = ["About you", "Education", "Experience", "Expertise"];

  function validate() {
    if (!formData.headline?.trim()) return "Headline is required";
    if (!formData.bio?.trim()) return "Bio is required";
    return null;
  }

  async function submit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/experts/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
          yearsExperience: formData.yearsExperience ? Number(formData.yearsExperience) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to submit application");
        setLoading(false);
        return;
      }
      router.push("/expert/verification");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex-1 text-center text-xs font-semibold py-2 rounded-full border ${
              i === step
                ? "bg-orangeDeep text-white border-orangeDeep"
                : i < step
                ? "bg-cream text-charcoal border-charcoal/8"
                : "bg-white text-inkSoft border-charcoal/8"
            }`}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {step === 0 && <Step1 formData={formData} setFormData={setFormData} />}
      {step === 1 && <Step2 formData={formData} setFormData={setFormData} />}
      {step === 2 && <Step3 formData={formData} setFormData={setFormData} />}
      {step === 3 && <Step4 formData={formData} setFormData={setFormData} />}

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="text-sm font-semibold text-charcoal hover:text-orange disabled:opacity-40"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Apply to become an expert"}
          </button>
        )}
      </div>
    </div>
  );
}
