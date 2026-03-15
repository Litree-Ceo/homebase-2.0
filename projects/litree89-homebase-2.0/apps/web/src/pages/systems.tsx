import Head from 'next/head';
import Link from 'next/link';

export default function SystemsPage() {
  return (
    <>
      <Head>
        <title>Systems | LiTreeLab&apos;Studio(tm)</title>
      </Head>
      <div className="studio-shell bg-noise text-[var(--studio-sand)]">
        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 pt-8 transition-transform duration-300">
          <div className="flex items-center gap-3">
            <span className="studio-mark" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--studio-ember)]">
                LITLABS
              </p>
              <p className="font-display text-lg tracking-wide">LiTreeLab&apos;Studio(tm)</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.3em] text-[var(--studio-sand)]/70 md:flex">
            <Link href="/systems" className="hover:text-[var(--studio-sand)] transition-colors">
              Systems
            </Link>
            <Link href="/bots" className="hover:text-[var(--studio-sand)] transition-colors">
              Bots
            </Link>
            <Link
              href="/ai-chat"
              className="hover:text-[var(--studio-sand)] transition-colors glow-purple"
            >
              AI Chat ✨
            </Link>
            <Link href="/homebase" className="hover:text-[var(--studio-sand)]">
              HomeBase
            </Link>
            <Link href="/metaverse" className="hover:text-[var(--studio-sand)] transition-colors">
              Metaverse
            </Link>
          </nav>
          <Link href="/homebase" className="studio-ghost">
            Enter HomeBase
          </Link>
        </header>
        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-16">
          <section className="space-y-4 text-center">
            <h1 className="font-display text-4xl md:text-6xl text-[var(--studio-sand)]">
              Studio Systems
            </h1>
            <p className="text-lg text-[var(--studio-sand)]/70">
              Details about the core systems that power LiTreeLab&apos;Studio(tm).
            </p>
            <Link href="/" className="studio-cta mt-8 inline-block">
              Back to Home
            </Link>
          </section>
        </main>
        <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-12 text-xs uppercase tracking-[0.3em] text-[var(--studio-sand)]/50">
          <p>LiTreeLab&apos;Studio(tm) is a LITLABS system.</p>
          <p>Build. Automate. Ship.</p>
        </footer>
      </div>
    </>
  );
}
