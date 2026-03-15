import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://litlabs.app"),
  title: {
    default: "LitLabs OS – AI Money Machine for Creators",
    template: "%s | LitLabs OS",
  },
  description:
    "LitLabs OS: Your AI-powered command center that handles content, DMs, promos, and fraud detection. Stack bread while you live your life.",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: 'website',
    title: "LitLabs OS – AI Money Machine for Creators",
    description:
      "Your AI-powered command center that handles content, DMs, promos, and fraud detection. Stack bread while you live your life.",
    url: '/',
    siteName: 'LitLabs OS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LitLabs OS – AI Money Machine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LitLabs OS – AI Money Machine for Creators',
    description:
      'Your AI-powered command center. Content, DMs, promos, fraud detection – all on autopilot.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#a855f7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
