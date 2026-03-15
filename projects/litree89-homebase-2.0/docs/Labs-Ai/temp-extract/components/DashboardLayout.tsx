"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import LitLabsAssistant from "./LitLabsAssistant";
import SupportChat from "./SupportChat";
import { auth } from "@/lib/firebase";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: "🧩" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
  { href: "/dashboard/station", label: "My Station", icon: "🎯" },
  { href: "/dashboard/billing", label: "Billing", icon: "💳" },
  { href: "/dashboard/stats", label: "Stats", icon: "📊" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsub = auth.onAuthStateChanged((user) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      setIsAdmin(!!user && !!adminEmail && user.email === adminEmail);
    });

    return () => unsub();
  }, []);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Futuristic background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-10 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#ffffff11,_transparent_65%),linear-gradient(90deg,#ffffff08_1px,transparent_1px),linear-gradient(180deg,#ffffff08_1px,transparent_1px)] bg-[position:0_0,0_0,0_0] bg-[size:100%_100%,80px_80px,80px_80px] opacity-25" />
      </div>

      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden md:flex w-60 flex-col border-r border-white/15 bg-black/70 backdrop-blur-xl">
          <div className="px-4 pt-4 pb-3 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-pink-500 to-sky-500 flex items-center justify-center text-xs font-black">
                LL
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-wide">LitLabs</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Business OS
                </p>
              </div>
            </Link>
            <p className="mt-3 text-[11px] text-white/50">
              Command center for your posts, promos, DMs and fraud checks.
            </p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 text-xs">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    active
                      ? "bg-pink-500/20 border border-pink-500/70 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              href="/referrals"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                pathname === "/referrals"
                  ? "bg-emerald-500/20 border border-emerald-500/70 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>🎁</span>
              <span>Referrals</span>
            </Link>

            {/* Admin link - only for founder */}
            {isAdmin && (
              <>
                <div className="border-t border-white/10 my-2" />
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    pathname === "/admin"
                      ? "bg-purple-500/20 border border-purple-500/70 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>👑</span>
                  <span>God Mode</span>
                </Link>
              </>
            )}
          </nav>

          <div className="px-3 pb-4 text-[11px] text-white/45 border-t border-white/10">
            <p className="mb-1 font-semibold text-white/60">LitLabs tips</p>
            <p>
              Start each day with /daily_post, then /promo if your calendar is
              light.
            </p>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/15 bg-black/60 backdrop-blur px-4 py-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60">
                LitLabs Business OS™ · Dashboard online
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <span className="hidden sm:inline">
                Plan:{" "}
                <span className="text-emerald-300 font-semibold">Pro</span>
              </span>
              <span className="hidden sm:inline">Detroit, MI</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Floating LitLabs AI Assistant */}
      <LitLabsAssistant />

      {/* SPARK Support Chat */}
      <SupportChat />
    </div>
  );
}
