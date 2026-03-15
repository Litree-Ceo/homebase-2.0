import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from '@/lib/firebase';
import { SoundProvider } from '@/lib/sound-context';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LiTreeLabStudio™ | The Social Metaverse',
  description:
    'The universal operating system connecting everyone through music, games, and digital assets. Unite your creative universe and automate growth with ProfitPilot™.',
  keywords: ['LiTreeLabStudio', 'social metaverse', 'creator os', 'music', 'games', 'digital assets', 'ProfitPilot'],
  openGraph: {
    title: 'LiTreeLabStudio™',
    description: 'The Universal Social Metaverse for Creators.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${rajdhani.variable} font-sans bg-lab-dark-900 text-white antialiased selection:bg-lab-purple-500/30 selection:text-lab-purple-200`}>
        <FirebaseProvider>
          <SoundProvider>
            {children}
          </SoundProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
