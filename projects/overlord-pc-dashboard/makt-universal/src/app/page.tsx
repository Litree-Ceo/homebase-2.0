"use client";

import MAKTPlayer from '../components/MAKTPlayer';
import { useMAKT } from '../context/MAKTContext';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { HexGrid } from '../components/HexGrid';
import { WalletPanel } from '../components/WalletPanel';

export default function Home() {
  const { systemStatus, socialFeed, wallet } = useMAKT();

  return (
    <div className="min-h-screen p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold pulse-gold">MAKT Universal Dashboard v3.0</h1>
        <p className="text-makt-cyan mt-2">Beast Mode Activated</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


        {/* Overlord Grid (Hex-based System Controls) */}
        <section className="col-span-1 makt-card">
          <h2 className="text-xl font-bold mb-4 glow-cyan">Overlord Grid</h2>
          <HexGrid status={systemStatus} />
          <p>CPU: {systemStatus.cpu}% | Memory: {systemStatus.memory}%</p>
          {/* Add controls for system commands */}
        </section>

        {/* Lit-Aii Social Feed */}
        <section className="col-span-1 makt-card">
          <h2 className="text-xl font-bold mb-4 glow-cyan">Lit-Aii Social</h2>
          <ul>
            {socialFeed.map((post, index) => (
              <li key={index} className="mb-2">{post.content}</li>
            ))}
          </ul>
          {/* Add posting functionality */}
        </section>

        {/* Crypto Core Wallet */}
        <section className="col-span-1 makt-card">
          <h2 className="text-xl font-bold mb-4 glow-cyan">Crypto Core</h2>
          <WalletPanel wallet={wallet} />
          <p>Address: {wallet.address || 'Not connected'}</p>
          <p>Balance: {wallet.balance} ETH</p>
        </section>


      </div>
    </div>
  );
}
