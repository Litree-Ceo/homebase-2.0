
import { Metadata } from "next";
import { HoneycombGrid, HoneycombPodProps } from "../../components/HoneycombGrid";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  return {
    title: `LitLabs Station - User ${userId}`,
    description: "Personal creative workspace powered by LitLabs OS",
  };
}

  const { userId } = await params;

  // Define honeycomb pods with black, gold, red, yellow themes
  const pods: HoneycombPodProps[] = [
    {
      color1: "#000000",
      color2: "#FFD700",
      color3: "#FF0000",
      children: (
        <>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Recent Content</h3>
          <p>AI-generated posts, images, and videos</p>
        </>
      ),
    },
    {
      color1: "#FFD700",
      color2: "#FF0000",
      color3: "#FFF200",
      children: (
        <>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Templates</h3>
          <p>Custom templates and playbooks</p>
        </>
      ),
    },
    {
      color1: "#FF0000",
      color2: "#000000",
      color3: "#FFD700",
      children: (
        <>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Bots</h3>
          <p>Automated social media assistants</p>
        </>
      ),
    },
    {
      color1: "#FFD700",
      color2: "#000000",
      color3: "#FF0000",
      children: (
        <>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Honeycomb Pod</h3>
          <p>Ultra Litree Station customization</p>
        </>
      ),
    },
    {
      color1: "#000000",
      color2: "#FF0000",
      color3: "#FFD700",
      children: (
        <>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 8 }}>AI Persona</h3>
          <p>Multi-persona, smart agent features</p>
        </>
      ),
    },
    {
      color1: "#FFF200",
      color2: "#FFD700",
      color3: "#000000",
      children: (
        <>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Customize</h3>
          <p>Mix, match, and create your own pods</p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900 to-black">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-red-600 flex items-center justify-center text-5xl font-bold">
            LL
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#FFD700" }}>Creator Station</h1>
          <p className="text-slate-300">Powered by LitLabs OS</p>
        </div>

        {/* Honeycomb Grid */}
        <HoneycombGrid pods={pods} />

        {/* CTA */}
        <div className="text-center rounded-xl border border-yellow-500/50 bg-black/60 p-8 mt-12">
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#FFD700" }}>Want Your Own Station?</h2>
          <p className="text-slate-300 mb-6">
            Create AI content, automate workflows, and build your creative empire
          </p>
          <a
            href={`/auth?ref=${userId}`}
            className="inline-block px-8 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 font-semibold transition text-lg"
          >
            Get Started Free →
          </a>
        </div>
      </div>
    </div>
  );
}
