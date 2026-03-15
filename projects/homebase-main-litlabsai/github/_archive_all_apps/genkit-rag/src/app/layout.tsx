/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Metadata } from 'next';
import './globals.scss';
import { Rubik, Lato } from 'next/font/google';
import Script from 'next/script';

const rubik = Rubik({
  subsets: ['latin'],
  weight: '500',
  display: 'swap',
  variable: '--font-display',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'LitLabs AI',
  description: 'Your AI Travel Companion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-[100dvh]">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NCQT06PX5W"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-NCQT06PX5W');
          `}
        </Script>
      </head>
      <body
        className={`${rubik.variable} ${lato.variable} font-sans text-foreground min-h-screen w-full bg-surface`}
      >
        {children}
      </body>
    </html>
  );
}
