import './globals.css'
import { Inter } from 'next/font/google'
import { MAKTProvider } from '../context/MAKTContext'
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi'; // Assuming wagmi config is set up
import Sidebar from '../components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MAKT Universal Dashboard',
  description: 'Beast Mode Media Player and System Control',
}

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-makt-black text-makt-gold`}>
                <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <MAKTProvider>
              <div className="flex">
                <Sidebar />
                <main className="flex-grow p-8">
                  {children}
                </main>
              </div>
            </MAKTProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}