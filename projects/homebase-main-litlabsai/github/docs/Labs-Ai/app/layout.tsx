import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { initSentry } from "@/lib/sentry";

// Initialize Sentry once on the server
initSentry();

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://litlabs.app",
  ),
  title: {
    default: "LitLabs OS – Money-Making AI Command Center",
    template: "%s | LitLabs OS",
  },
  description:
    "LitLabs OS: daily content, DM sales, promos, fraud detection + live dashboard for beauty pros.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    title: "LitLabs OS – Money-Making AI Command Center",
    description:
      "Daily content, DM sales, promos, fraud detection + live dashboard for beauty pros.",
    url: "/",
    siteName: "LitLabs OS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LitLabs OS – Money-Making AI Command Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LitLabs OS – Money-Making AI Command Center",
    description:
      "Daily content, DM sales, promos, fraud detection + live dashboard for beauty pros.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <ScrollProgress />
        <AuthProvider>{children}</AuthProvider>
        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
