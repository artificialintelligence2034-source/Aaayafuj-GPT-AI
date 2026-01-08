
import React from 'react';
import { View } from '../types';
import { 
  MessageSquare, 
  BrainCircuit, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Mic,
  Settings, 
  Cpu, 
  ChevronLeft, 
  ChevronRight,
  Code,
  Bot
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const navItems = [
    { view: View.CHAT, label: 'Chat', icon: MessageSquare },
    { view: View.TRAINING, label: 'Learn', icon: BrainCircuit },
    { view: View.MEDIA, label: 'Media', icon: ImageIcon },
    { view: View.VIDEO, label: 'Video', icon: VideoIcon },
    { view: View.VOICE, label: 'Vocal', icon: Mic },
    { view: View.BUILDER, label: 'Build', icon: Code },
    { view: View.SYSTEM, label: 'Core', icon: Cpu },
    { view: View.SETTINGS, label: 'Matrix', icon: Settings },
  ];

  return (
    <div className={`${isOpen ? 'w-56' : 'w-16'} bg-black/20 backdrop-blur-md border-r border-white/5 flex flex-col transition-all duration-300 relative z-30`}>
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 theme-accent-bg rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Bot size={24} className="text-zinc-950" />
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-sm bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent uppercase">
              AAAYAFUJ
            </span>
            <span className="text-[7px] font-bold text-emerald-500/70 tracking-[0.3em] uppercase">Robot Identity</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                isActive 
                  ? 'bg-white/10 text-white shadow-xl ring-1 ring-white/10' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} className={isActive ? 'theme-accent-text' : 'group-hover:scale-110 transition-transform'} />
              {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-500 transition-all border border-white/5"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
