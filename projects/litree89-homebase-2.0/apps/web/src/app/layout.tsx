import type { Metadata } from 'next';
import React from 'react';
import '@/globals.css';
import '@/index.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: "LiTreeLab'Studio™ - Connect. Create. Earn.",
  description:
    'The all-in-one platform for creators, bots, and communities. Share content, manage bots, monetize your audience.',
  icons: {
    icon: '/favicon.ico',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6b21a8" />
      </head>
      <body className="honeycomb-bg min-h-screen text-honeycomb-brightGold antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
