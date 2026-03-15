import { LabHero } from "@/components/LabHero";
import { LabFeatureGrid } from "@/components/LabFeatureGrid";
import { LabPricing } from "@/components/LabPricing";
import { LabPaymentMock } from "@/components/LabPaymentMock";
import { LabHireMe } from "@/components/LabHireMe";
import { LabAdminSecurity } from "@/components/LabAdminSecurity";
import { LabMonetization } from "@/components/LabMonetization";
import { LabRoadmap } from "@/components/LabRoadmap";
import { LabAppPreview } from "@/components/LabAppPreview";
import { LabMarketplace } from "@/components/LabMarketplace";
import { LabEmulationHub } from "@/components/LabEmulationHub";
import { LabAIAssistantUI } from "@/components/LabAIAssistantUI";
import { LabMobileConcept } from "@/components/LabMobileConcept";
import { LabCommunity } from "@/components/LabCommunity";
import { LabArchitecture } from "@/components/LabArchitecture";
import { LabLiveInteractive } from "@/components/LabLiveInteractive";
import { LabPaymentDemo } from "@/components/LabPaymentDemo";
import { LabMarketing } from "@/components/LabMarketing";
import { LabPreferences } from "@/components/LabPreferences";
import { LabCommunityCTA } from "@/components/LabCommunityCTA";
import { LabAdminGuard } from "@/components/LabAdminGuard";
import { LabParticles } from "@/components/LabParticles";
import { PreferencesProvider } from "@/components/PreferenceProvider";

export const dynamic = "force-static";

export default function LabStudioPage() {
  return (
    <PreferencesProvider>
      <main className="relative min-h-screen bg-slate-950 text-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <LabParticles />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 space-y-10">
          <LabHero />
          <LabLiveInteractive />
          <LabAppPreview />
          <LabFeatureGrid />
          <LabPricing />
          <LabPaymentMock />
          <LabPaymentDemo />
          <LabMonetization />
          <LabAdminSecurity />
          <LabMarketplace />
          <LabEmulationHub />
          <LabAIAssistantUI />
          <LabMobileConcept />
          <LabCommunity />
          <LabCommunityCTA />
          <LabArchitecture />
          <LabMarketing />
          <LabAdminGuard />
          <LabPreferences />
          <LabHireMe />
          <LabRoadmap />
        </div>
      </main>
    </PreferencesProvider>
  );
}
