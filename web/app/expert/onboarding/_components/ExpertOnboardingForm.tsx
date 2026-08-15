"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StepProgress from "./StepProgress";
import ExpertiseChips from "./ExpertiseChips";
import ServiceSelector from "./ServiceSelector";
import AvailabilityStep, { type DayAvailability } from "./AvailabilityStep";

const STEPS = [
  "Welcome",
  "Expertise",
  "Services",
  "Availability",
  "WhatsApp",
  "Plan",
  "Success",
];

const COUNTRIES = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "UAE" },
  { code: "AU", label: "Australia" },
  { code: "CA", label: "Canada" },
];

const CURRENCIES = [
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "AED", label: "AED — UAE Dirham" },
];

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">
        {label} {optional && <span className="text-inkSoft">(optional)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">
        {label} {optional && <span className="text-inkSoft">(optional)</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition min-h-[100px]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { code: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-cream border border-transparent px-4 py-3 text-charcoal focus:bg-white focus:border-orange outline-none transition"
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Step components ───────────────────────────────────────────────────────

function Step1Welcome({
  currentRole,
  setCurrentRole,
  company,
  setCompany,
  yearsExperience,
  setYearsExperience,
  industry,
  setIndustry,
  headline,
  setHeadline,
  bSchool,
  setBSchool,
  location,
  setLocation,
  bio,
  setBio,
  socials,
  setSocials,
  country,
  setCountry,
  currency,
  setCurrency,
}: {
  currentRole: string;
  setCurrentRole: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  yearsExperience: string;
  setYearsExperience: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  headline: string;
  setHeadline: (v: string) => void;
  bSchool: string;
  setBSchool: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  socials: { linkedIn: string; twitter: string; instagram: string };
  setSocials: (s: { linkedIn: string; twitter: string; instagram: string }) => void;
  country: string;
  setCountry: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-charcoal mb-1">
          Hello there! 👋
        </h2>
        <p className="text-inkSoft">
          Let&apos;s start with the basics so students know who you are.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Current role"
            value={currentRole}
            onChange={setCurrentRole}
            placeholder="e.g. Product Manager"
          />
          <InputField
            label="Company"
            value={company}
            onChange={setCompany}
            placeholder="e.g. Google"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Years of experience"
            type="number"
            value={yearsExperience}
            onChange={setYearsExperience}
            placeholder="e.g. 5"
          />
          <InputField
            label="Industry"
            optional
            value={industry}
            onChange={setIndustry}
            placeholder="e.g. Technology"
          />
        </div>

        <InputField
          label="Profile headline"
          optional
          value={headline}
          onChange={setHeadline}
          placeholder="e.g. Product Leader helping MBA students break into tech"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Business school"
            optional
            value={bSchool}
            onChange={setBSchool}
            placeholder="e.g. IIM Bangalore"
          />
          <InputField
            label="Location"
            optional
            value={location}
            onChange={setLocation}
            placeholder="e.g. Bangalore"
          />
        </div>

        <TextAreaField
          label="Short bio"
          optional
          value={bio}
          onChange={setBio}
          placeholder="Tell students a little about your background and how you can help."
        />

        <div className="pt-2 border-t border-charcoal/8" />

        <InputField
          label="LinkedIn URL"
          value={socials.linkedIn}
          onChange={(v) => setSocials({ ...socials, linkedIn: v })}
          placeholder="https://linkedin.com/in/your-profile"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Twitter"
            optional
            value={socials.twitter}
            onChange={(v) => setSocials({ ...socials, twitter: v })}
            placeholder="https://twitter.com/yourhandle"
          />
          <InputField
            label="Instagram"
            optional
            value={socials.instagram}
            onChange={(v) => setSocials({ ...socials, instagram: v })}
            placeholder="https://instagram.com/yourhandle"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Country"
            value={country}
            onChange={setCountry}
            options={COUNTRIES}
          />
          <SelectField
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={CURRENCIES}
          />
        </div>
      </div>
    </div>
  );
}

function Step2Expertise({
  expertise,
  setExpertise,
}: {
  expertise: string[];
  setExpertise: (v: string[]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-charcoal mb-1">
          What&apos;s your expertise?
        </h2>
        <p className="text-inkSoft">
          Select all areas where you can genuinely help MBA students.
        </p>
      </div>
      <ExpertiseChips selected={expertise} onChange={setExpertise} />
    </div>
  );
}

function Step3Services({
  services,
  setServices,
}: {
  services: string[];
  setServices: (v: string[]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-charcoal mb-1">
          Which services will you offer?
        </h2>
        <p className="text-inkSoft">
          You can edit pricing and details from your dashboard later.
        </p>
      </div>
      <ServiceSelector selected={services} onChange={setServices} />
    </div>
  );
}

function Step4Availability({
  availability,
  setAvailability,
}: {
  availability: DayAvailability[];
  setAvailability: (v: DayAvailability[]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-charcoal mb-1">
          Set your weekly availability
        </h2>
        <p className="text-inkSoft">
          Students will be able to book sessions during these hours (IST).
        </p>
      </div>
      <AvailabilityStep value={availability} onChange={setAvailability} />
    </div>
  );
}

function Step5WhatsApp({
  phone,
  setPhone,
}: {
  phone: string;
  setPhone: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-charcoal mb-1">
          Add your WhatsApp number
        </h2>
        <p className="text-inkSoft">
          We&apos;ll use this to send you booking notifications. Not shown publicly.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">WhatsApp number</label>
        <div className="flex items-center gap-0">
          <span className="inline-flex items-center rounded-l-xl bg-cream border border-r-0 border-transparent px-4 py-3 text-charcoal font-semibold text-sm shrink-0">
            +91
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            maxLength={10}
            className="flex-1 rounded-r-xl bg-cream border border-transparent px-4 py-3 text-charcoal placeholder-inkSoft/50 focus:bg-white focus:border-orange outline-none transition"
          />
        </div>
        <p className="text-xs text-inkSoft">Enter your 10-digit mobile number</p>
      </div>
    </div>
  );
}

function Step6Plan() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-charcoal mb-1">
          Your listing plan
        </h2>
        <p className="text-inkSoft">Simple, transparent pricing with no upfront cost.</p>
      </div>

      <div className="rounded-2xl border-2 border-orangeDeep/30 bg-orange/5 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display font-bold text-xl text-charcoal">Free to list</p>
            <p className="text-inkSoft text-sm mt-1">
              Embark takes a commission on paid bookings only. No monthly fees.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center rounded-full bg-green/10 text-green border border-green/20 text-xs font-bold px-3 py-1 uppercase tracking-wide">
            Current plan
          </span>
        </div>

        <div className="space-y-2.5">
          {[
            "Unlimited student reach — no cap on bookings",
            "Full profile customization",
            "Built-in calendar and booking management",
            "Commission only on successful bookings",
          ].map((feat) => (
            <div key={feat} className="flex items-start gap-2.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-green shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="text-sm text-charcoal">{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Wizard ───────────────────────────────────────────────────────────

export default function ExpertOnboardingForm(_props: { userName?: string | null } = {}) {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1); // 1-indexed
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Step 1 — professional profile
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [headline, setHeadline] = useState("");
  const [bSchool, setBSchool] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState({ linkedIn: "", twitter: "", instagram: "" });
  const [country, setCountry] = useState("IN");
  const [currency, setCurrency] = useState("INR");

  // Step 2 — Expertise
  const [expertise, setExpertise] = useState<string[]>([]);

  // Step 3 — Services
  const [services, setServices] = useState<string[]>([]);

  // Step 4 — Availability
  const [availability, setAvailability] = useState<DayAvailability[]>([]);

  // Step 5 — WhatsApp
  const [phone, setPhone] = useState("");

  // Load existing profile state on mount.
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/experts/onboarding");
        const json = (await res.json()) as {
          profile?: {
            currentRole?: string | null;
            currentCompany?: string | null;
            yearsExperience?: number | null;
            industry?: string | null;
            headline?: string | null;
            bSchool?: string | null;
            location?: string | null;
            bio?: string | null;
            socialLinks?: { linkedIn?: string; twitter?: string; instagram?: string } | null;
            country?: string | null;
            currency?: string | null;
            expertise?: string[];
            onboardingStep?: number;
            onboardingComplete?: boolean;
          } | null;
        };
        const p = json.profile;
        if (p) {
          setCurrentRole(p.currentRole || "");
          setCompany(p.currentCompany || "");
          setYearsExperience(p.yearsExperience?.toString() || "");
          setIndustry(p.industry || "");
          setHeadline(p.headline || "");
          setBSchool(p.bSchool || "");
          setLocation(p.location || "");
          setBio(p.bio || "");
          setSocials({
            linkedIn: p.socialLinks?.linkedIn || "",
            twitter: p.socialLinks?.twitter || "",
            instagram: p.socialLinks?.instagram || "",
          });
          setCountry(p.country || "IN");
          setCurrency(p.currency || "INR");
          setExpertise(Array.isArray(p.expertise) ? p.expertise : []);
          // Resume at the last saved step (clamp between 1 and 6).
          const savedStep = p.onboardingStep ?? 0;
          if (!p.onboardingComplete && savedStep > 0 && savedStep < 7) {
            setStep(savedStep + 1);
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding state", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const persist = useCallback(
    async (stepNum: number, extra: Record<string, unknown> = {}) => {
      setSaving(true);
      setError("");
      try {
        const payload: Record<string, unknown> = {
          onboardingStep: stepNum,
          onboardingComplete: stepNum >= 7,
          currentRole,
          company,
          yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
          industry,
          headline,
          bSchool,
          location,
          bio,
          socialLinks: {
            linkedIn: socials.linkedIn || undefined,
            twitter: socials.twitter || undefined,
            instagram: socials.instagram || undefined,
          },
          country,
          currency,
          expertise,
          services,
          availabilities: availability,
          whatsappNumber: phone ? `+91${phone}` : undefined,
          ...extra,
        };

        const res = await fetch("/api/v1/experts/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = (await res.json()) as {
          message?: string;
          roles?: string[];
          permissions?: string[];
        };
        if (!res.ok) {
          setError(json.message || "Failed to save. Please try again.");
          return false;
        }
        return { ok: true, roles: json.roles, permissions: json.permissions };
      } catch {
        setError("Network error. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [currentRole, company, yearsExperience, industry, headline, bSchool, location, bio, socials, country, currency, expertise, services, availability, phone]
  );

  async function handleNext() {
    const result = await persist(step);
    if (!result || !result.ok) return;
    setStep((s) => s + 1);
  }

  async function handleFinish() {
    const result = await persist(7, { onboardingComplete: true });
    if (!result || !result.ok) return;

    // Refresh the session so the middleware recognises the Expert role and
    // completed onboarding.
    await update({
      onboardingComplete: true,
      onboardingRole: "Expert",
      roles: result.roles,
      permissions: result.permissions,
    });

    router.push("/expert/dashboard");
    router.refresh();
  }

  const isLast = step === 6;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <StepProgress current={step} steps={STEPS} />

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Step content */}
      <div>
        {step === 1 && (
          <Step1Welcome
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            company={company}
            setCompany={setCompany}
            yearsExperience={yearsExperience}
            setYearsExperience={setYearsExperience}
            industry={industry}
            setIndustry={setIndustry}
            headline={headline}
            setHeadline={setHeadline}
            bSchool={bSchool}
            setBSchool={setBSchool}
            location={location}
            setLocation={setLocation}
            bio={bio}
            setBio={setBio}
            socials={socials}
            setSocials={setSocials}
            country={country}
            setCountry={setCountry}
            currency={currency}
            setCurrency={setCurrency}
          />
        )}
        {step === 2 && (
          <Step2Expertise expertise={expertise} setExpertise={setExpertise} />
        )}
        {step === 3 && (
          <Step3Services services={services} setServices={setServices} />
        )}
        {step === 4 && (
          <Step4Availability
            availability={availability}
            setAvailability={setAvailability}
          />
        )}
        {step === 5 && <Step5WhatsApp phone={phone} setPhone={setPhone} />}
        {step === 6 && <Step6Plan />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-charcoal/8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || saving}
          className="text-sm font-semibold text-charcoal hover:text-orange disabled:opacity-40 transition"
        >
          ← Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
          >
            {saving ? "Finishing…" : "Finish setup"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-7 py-3.5 hover:bg-[#1740A8] transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
