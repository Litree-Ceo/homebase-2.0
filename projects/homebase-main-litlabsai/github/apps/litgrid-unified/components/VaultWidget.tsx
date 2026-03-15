"use client";

import { Wallet, CreditCard, Activity, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function VaultWidget() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white rounded-md overflow-hidden border border-white/10 glass-panel">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-litPurple/20 to-transparent">
        <h2 className="font-bold flex items-center gap-2 text-lg">
          <Wallet className="text-litPurple" />
          The Vault
        </h2>
        <span className="text-xs bg-litPurple/20 text-litPurple px-2 py-1 rounded-full border border-litPurple/30">Connected</span>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <p className="text-white/50 text-sm mb-1">Total Balance</p>
          <h1 className="text-4xl font-black tracking-tight">$4,250.00 <span className="text-litPurple text-xl">LIT</span></h1>
          <p className="text-matrix text-xs flex items-center justify-center gap-1 mt-2">
            <Activity size={12} /> +12.5% this week
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group">
            <ArrowUpRight className="text-matrix group-hover:-translate-y-1 transition-transform" />
            <span className="text-sm">Send</span>
          </button>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group">
            <ArrowDownLeft className="text-litBlue group-hover:translate-y-1 transition-transform" />
            <span className="text-sm">Receive</span>
          </button>
        </div>

        <button className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors">
          <CreditCard size={18} />
          Buy with Google Pay
        </button>
      </div>
    </div>
  );
}
