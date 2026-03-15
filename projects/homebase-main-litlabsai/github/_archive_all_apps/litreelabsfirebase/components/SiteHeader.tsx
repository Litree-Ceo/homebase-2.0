"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/demo", label: "Demo" },
    { href: "/speech", label: "Speech" },
    { href: "/faq", label: "FAQ" },
    { href: "/referrals", label: "Earn $" },
    { href: "/dashboard", label: "Login" },
  ];

  return (
    <header className="w-full border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-500 to-sky-500 flex items-center justify-center text-xs font-black">
            LL
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide">LitLabs</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Business OS
            </p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-white/80">
          {navItems.map((item) => {
            const isCurrent =
              item.href.startsWith("/") && pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-white transition ${
                  isCurrent ? "text-pink-400" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-full bg-pink-500 text-[11px] font-semibold shadow-md shadow-pink-500/30 hover:bg-pink-400"
          >
            Open Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
