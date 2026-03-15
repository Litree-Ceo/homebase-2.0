import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Litgrid Social OS",
  description: "Unified AI Command Center & Creator Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
