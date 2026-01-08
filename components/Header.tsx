
import React from 'react';
import { View } from '../types';
import { ShieldCheck, HardDrive } from 'lucide-react';

interface HeaderProps {
  currentView: View;
}

const Header: React.FC<HeaderProps> = ({ currentView }) => {
  // Added missing View.VOICE to satisfy Record<View, string>
  const titles: Record<View, string> = {
    [View.CHAT]: 'Neural Communication Channel',
    [View.TRAINING]: 'Autonomous Learning Module',
    [View.MEDIA]: 'Local Media Generation Lab',
    [View.VIDEO]: 'Sovereign Temporal Video Lab',
    [View.VOICE]: 'Neural Resonance Vocal Lab',
    [View.SYSTEM]: 'Sovereign Hardware Core',
    [View.BUILDER]: 'Offline Application Architect',
    [View.SETTINGS]: 'Visual Configuration Matrix'
  };

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md sticky top-0 z-20">
      <div className="flex flex-col">
        <h1 className="text-xs font-black tracking-[0.2em] text-zinc-100 flex items-center gap-3 uppercase">
          {titles[currentView]}
          <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[9px] text-zinc-500 border border-white/5 font-bold">LTS_V2.5</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Air-Gapped</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
          <HardDrive size={14} className="text-zinc-500" />
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">DB: 4.2TB Free</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
