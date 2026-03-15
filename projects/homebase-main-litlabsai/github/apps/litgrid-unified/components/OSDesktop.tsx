"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minus, X, LayoutGrid } from "lucide-react";
import CortexChat from "./CortexChat";
import VaultWidget from "./VaultWidget";

export default function OSDesktop() {
  const [windows, setWindows] = useState([
    { id: "cortex", title: "Cortex AI", component: <CortexChat />, x: 50, y: 50, w: 400, h: 550, z: 1, open: true },
    { id: "vault", title: "Vault", component: <VaultWidget />, x: 500, y: 150, w: 350, h: 450, z: 2, open: true }
  ]);

  const focusWindow = (id: string) => {
    setWindows(windows.map(w => ({
      ...w,
      z: w.id === id ? 10 : w.z > 1 ? w.z - 1 : w.z
    })));
  };

  const closeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, open: false } : w));
  };

  const openWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, open: true } : w));
    focusWindow(id);
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Desktop Area */}
      {windows.filter(w => w.open).map(w => (
        <motion.div
          key={w.id}
          drag
          dragMomentum={false}
          initial={{ x: w.x, y: w.y, opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onPointerDown={() => focusWindow(w.id)}
          style={{ zIndex: w.z, width: w.w, height: w.h }}
          className="absolute rounded-lg shadow-2xl glass-panel flex flex-col overflow-hidden border border-white/10"
        >
          {/* Window Title Bar */}
          <div className="h-8 bg-black/60 border-b border-white/10 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing backdrop-blur-md">
            <span className="text-xs font-semibold text-white/80">{w.title}</span>
            <div className="flex gap-2">
              <button className="text-white/40 hover:text-white transition-colors"><Minus size={12} /></button>
              <button className="text-white/40 hover:text-white transition-colors"><Maximize2 size={12} /></button>
              <button onClick={() => closeWindow(w.id)} className="text-white/40 hover:text-red-500 transition-colors"><X size={12} /></button>
            </div>
          </div>
          {/* Window Content */}
          <div className="flex-1 relative overflow-hidden">
            {w.component}
          </div>
        </motion.div>
      ))}

      {/* OS Taskbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-14 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50">
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
          <LayoutGrid size={24} />
        </button>
        <div className="w-px h-6 bg-white/20"></div>
        {windows.map(w => (
          <button 
            key={`dock-${w.id}`}
            onClick={() => openWindow(w.id)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              w.open ? "bg-white/15 text-white shadow-inner" : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {w.title}
          </button>
        ))}
      </div>
    </div>
  );
}
