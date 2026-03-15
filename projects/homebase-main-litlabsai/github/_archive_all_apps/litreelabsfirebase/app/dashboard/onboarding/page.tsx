"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import DashboardLayout from "../../../components/DashboardLayout";
import { AuthGate } from "../../../components/AuthGate";

type OnboardingForm = {
  businessName: string;
  location: string;
  services: string;
  vibe: string;
  brandWords: string;
  idealClients: string;
  priceRange: string;
  dontWantClients: string;
  platforms: string;
  contentRules: string;
  workDays: string;
  slowDays: string;
  bookingWindow: string;
  bookingMethod: string;
  additionalInfo: string;
};

function OnboardingInner() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<OnboardingForm>({
    businessName: "",
    location: "",
    services: "",
    vibe: "",
    brandWords: "",
    idealClients: "",
    priceRange: "",
    dontWantClients: "",
    platforms: "",
    contentRules: "",
    workDays: "",
    slowDays: "",
    bookingWindow: "",
    bookingMethod: "",
    additionalInfo: "",
  });
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleInputChange = (field: keyof OnboardingForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinish = async () => {
    if (!auth.currentUser) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    try {
      // Save to Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        onboarding: {
          ...formData,
          completedAt: serverTimestamp(),
          completed: true,
        },
        onboardingStep: 3,
      });

      // Show success message
      alert("✅ Your profile is set up! Redirecting...");
      
      // Redirect back to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert("❌ Error saving profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/50 mb-1">Onboarding</p>
            <h1 className="text-xl sm:text-2xl font-semibold">
              Let&apos;s teach LitLabs who you are.
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              The more details you give, the better your posts, promos, and DM
              replies will match your vibe, city, and ideal clients.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <StepBubble current={step} index={1} label="Basics" />
            <StepBubble current={step} index={2} label="Clients" />
            <StepBubble current={step} index={3} label="Schedule" />
          </div>
        </section>

        {/* Steps */}
        {step === 1 && <StepBasics formData={formData} onChange={handleInputChange} />}
        {step === 2 && <StepClients formData={formData} onChange={handleInputChange} />}
        {step === 3 && <StepSchedule formData={formData} onChange={handleInputChange} />}

        {/* Nav buttons */}
        <section className="flex items-center justify-between pt-3 text-[11px]">
          <button
            onClick={prev}
            disabled={step === 1}
            className="px-3 py-1.5 rounded-full border border-white/25 bg-white/5 text-white/80 disabled:opacity-40 hover:bg-white/10"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                onClick={next}
                className="px-4 py-1.5 rounded-full bg-pink-500 text-[11px] font-semibold shadow-[0_0_18px_rgba(236,72,153,0.6)] hover:bg-pink-400"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-4 py-1.5 rounded-full bg-emerald-500 text-[11px] font-semibold shadow-[0_0_18px_rgba(16,185,129,0.6)] hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Finish & return to dashboard"}
              </button>
            )}
          </div>
        </section>

        <p className="text-[11px] text-white/40">
          You can come back and update this any time. LitLabs will use this to
          shape your captions, promos, DM scripts, and fraud checks.
        </p>
      </div>
    </DashboardLayout>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGate>
      <OnboardingInner />
    </AuthGate>
  );
}

/* Helper components */

function StepBubble({
  current,
  index,
  label,
}: {
  current: number;
  index: number;
  label: string;
}) {
  const active = current === index;
  return (
    <div className="flex items-center gap-1">
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] border ${
          active
            ? "bg-pink-500 border-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.7)]"
            : "bg-black/60 border-white/30"
        }`}
      >
        {index}
      </div>
      <span
        className={`hidden sm:inline text-[11px] ${
          active ? "text-white" : "text-white/55"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-black/80 p-4 sm:p-5 backdrop-blur space-y-3 text-xs sm:text-sm">
      {children}
    </div>
  );
}

function Input({
  label,
  placeholder,
  helper,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  helper?: string;
  value?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-white/65">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-white/20 bg-black/70 px-3 py-2 text-xs focus:outline-none focus:border-pink-500/80 focus:ring-1 focus:ring-pink-500/60"
        placeholder={placeholder}
      />
      {helper && (
        <p className="text-[10px] text-white/45">{helper}</p>
      )}
    </div>
  );
}

function TextArea({
  label,
  placeholder,
  helper,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  helper?: string;
  value?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-white/65">{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        rows={3}
        className="w-full rounded-2xl border border-white/20 bg-black/70 px-3 py-2 text-xs focus:outline-none focus:border-pink-500/80 focus:ring-1 focus:ring-pink-500/60"
        placeholder={placeholder}
      />
      {helper && (
        <p className="text-[10px] text-white/45">{helper}</p>
      )}
    </div>
  );
}

/* STEP CONTENTS */

function StepBasics({ formData, onChange }: { formData: OnboardingForm; onChange: (field: keyof OnboardingForm, val: string) => void }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="text-xs font-semibold text-white/75 mb-2">
          Your business basics
        </p>
        <Input
          label="Business name"
          placeholder="LitLabs Studio, Faded by Rae, Glow Room Lash Bar..."
          value={formData.businessName}
          onChange={(val) => onChange("businessName", val)}
        />
        <Input
          label="Location (city & area)"
          placeholder="Detroit, MI — Downtown / East side / etc."
          value={formData.location}
          onChange={(val) => onChange("location", val)}
        />
        <Input
          label="Main services"
          placeholder="Example: fades, tapers, wigs, acrylics, lash extensions..."
          value={formData.services}
          onChange={(val) => onChange("services", val)}
        />
      </Card>

      <Card>
        <p className="text-xs font-semibold text-white/75 mb-2">
          Your vibe
        </p>
        <TextArea
          label="How do you want people to feel when they see your page?"
          placeholder="Example: clean, luxury, cozy, street, colorful, edgy..."
          value={formData.vibe}
          onChange={(val) => onChange("vibe", val)}
        />
        <TextArea
          label="Words you like for your brand"
          placeholder="Example: booked & busy, lowkey, chill, bougie, underground..."
          value={formData.brandWords}
          onChange={(val) => onChange("brandWords", val)}
        />
      </Card>
    </section>
  );
}

function StepClients({ formData, onChange }: { formData: OnboardingForm; onChange: (field: keyof OnboardingForm, val: string) => void }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="text-xs font-semibold text-white/75 mb-2">
          Your ideal clients
        </p>
        <TextArea
          label="Who do you WANT more of?"
          placeholder="Example: full sets, color clients, big-ticket lash sets, beard trims..."
          value={formData.idealClients}
          onChange={(val) => onChange("idealClients", val)}
        />
        <Input
          label="Average price range"
          placeholder="Example: $60–$120 per appointment"
          value={formData.priceRange}
          onChange={(val) => onChange("priceRange", val)}
        />
        <TextArea
          label="Clients you DO NOT want"
          placeholder="Example: last-minute cancellations, no-shows, price shoppers..."
          helper="LitLabs will avoid calling in people you don&apos;t want."
          value={formData.dontWantClients}
          onChange={(val) => onChange("dontWantClients", val)}
        />
      </Card>

      <Card>
        <p className="text-xs font-semibold text-white/75 mb-2">
          Platforms you use
        </p>
        <TextArea
          label="Where do you post now?"
          placeholder="Example: Instagram Reels, TikTok, Facebook, Snapchat..."
          value={formData.platforms}
          onChange={(val) => onChange("platforms", val)}
        />
        <TextArea
          label="Any rules or things you never want in your content?"
          placeholder="Example: no cussing in captions, no mentioning kids, no politics..."
          value={formData.contentRules}
          onChange={(val) => onChange("contentRules", val)}
        />
      </Card>
    </section>
  );
}

function StepSchedule({ formData, onChange }: { formData: OnboardingForm; onChange: (field: keyof OnboardingForm, val: string) => void }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="text-xs font-semibold text-white/75 mb-2">
          Your schedule
        </p>
        <Input
          label="Normal work days"
          placeholder="Example: Tue–Sat, or Wed–Sun"
          value={formData.workDays}
          onChange={(val) => onChange("workDays", val)}
        />
        <Input
          label="Slow days / times"
          placeholder="Example: Tuesdays, weekday mornings, Sunday evenings..."
          helper="LitLabs will push promos harder on these days."
          value={formData.slowDays}
          onChange={(val) => onChange("slowDays", val)}
        />
        <Input
          label="How far ahead do you like to book?"
          placeholder="Example: 1 week, 2 weeks, end of the month..."
          value={formData.bookingWindow}
          onChange={(val) => onChange("bookingWindow", val)}
        />
      </Card>

      <Card>
        <p className="text-xs font-semibold text-white/75 mb-2">
          Booking & contact
        </p>
        <Input
          label="Main way clients book"
          placeholder="Example: DM, text, booking link, website..."
          value={formData.bookingMethod}
          onChange={(val) => onChange("bookingMethod", val)}
        />
        <TextArea
          label="Anything else LitLabs should know?"
          placeholder="Example: you&apos;re balancing a 9–5, family schedule, or limited days."
          value={formData.additionalInfo}
          onChange={(val) => onChange("additionalInfo", val)}
        />
        <p className="text-[10px] text-emerald-300 pt-1">
          The more real you are here, the smarter your scripts and promos will feel.
        </p>
      </Card>
    </section>
  );
}
