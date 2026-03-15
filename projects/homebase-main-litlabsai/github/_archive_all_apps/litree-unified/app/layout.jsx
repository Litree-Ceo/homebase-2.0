import './globals.css';
import { Inter } from 'next/font/google';
import AuthProvider from '../components/AuthProvider';
import SecurityProvider from '../components/SecurityProvider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: "LiTreeLab'Studio™ - Social Media Metaverse",
  description: "Connect, Create, and Explore in the LiTreeLab'Studio™ Metaverse",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SecurityProvider>
          <AuthProvider>{children}</AuthProvider>
        </SecurityProvider>
      </body>
    </html>
  );
}
