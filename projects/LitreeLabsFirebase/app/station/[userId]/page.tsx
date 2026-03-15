import { Metadata } from "next";

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

export default async function PublicStationPage({ params }: Props) {
  const { userId } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center text-5xl font-bold">
            LL
          </div>
          <h1 className="text-4xl font-bold mb-2">Creator Station</h1>
          <p className="text-slate-300">Powered by LitLabs OS</p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
            <h3 className="font-semibold mb-2">Recent Content</h3>
            <p className="text-sm text-slate-400">AI-generated posts, images, and videos</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
            <h3 className="font-semibold mb-2">Templates</h3>
            <p className="text-sm text-slate-400">Custom templates and playbooks</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
            <h3 className="font-semibold mb-2">Bots</h3>
            <p className="text-sm text-slate-400">Automated social media assistants</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-xl border border-emerald-500/50 bg-slate-800/60 p-8">
          <h2 className="text-2xl font-bold mb-3">Want Your Own Station?</h2>
          <p className="text-slate-300 mb-6">
            Create AI content, automate workflows, and build your creative empire
          </p>
          <a
            href={`/auth?ref=${userId}`}
            className="inline-block px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold transition text-lg"
          >
            Get Started Free →
          </a>
        </div>
      </div>
    </div>
  );
}
