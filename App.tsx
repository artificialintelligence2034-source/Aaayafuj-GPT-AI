
import React, { useState, useEffect } from 'react';
import { View, Message, LocalFile, ThemeConfig } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import TrainingCenter from './components/TrainingCenter';
import MediaLab from './components/MediaLab';
import VideoLab from './components/VideoLab';
import VoiceLab from './components/VoiceLab';
import SystemMonitor from './components/SystemMonitor';
import AppBuilder from './components/AppBuilder';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CHAT);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('aaayafuj_memory_stream');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'init',
      role: 'assistant',
      content: `# hello. i am aaayafuj gpt. i am a sovereign intelligence. how can i assist you today? 🙂

## sovereign core active (100b+ permutations mastered 🚀)

* air-gapped logic active ✅
* persistent neural brain active ✅
* training module awaiting vocal shards 🧠

**[ready for owner command]**`,
      timestamp: Date.now()
    }];
  });

  const [files, setFiles] = useState<LocalFile[]>(() => {
    const saved = localStorage.getItem('aaayafuj_knowledge_base');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('aaayafuj_theme');
    return saved ? JSON.parse(saved) : { bgColor: '#09090b', accentColor: '#10b981' };
  });

  useEffect(() => {
    localStorage.setItem('aaayafuj_memory_stream', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('aaayafuj_knowledge_base', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', theme.bgColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    localStorage.setItem('aaayafuj_theme', JSON.stringify(theme));
  }, [theme]);

  const renderView = () => {
    switch (currentView) {
      case View.CHAT:
        return <ChatContainer messages={messages} setMessages={setMessages} knowledgeBase={files} />;
      case View.TRAINING:
        return <TrainingCenter files={files} setFiles={setFiles} />;
      case View.MEDIA:
        return <MediaLab knowledgeBase={files} />;
      case View.VIDEO:
        return <VideoLab knowledgeBase={files} />;
      case View.VOICE:
        return <VoiceLab knowledgeBase={files} />;
      case View.SYSTEM:
        return <SystemMonitor />;
      case View.BUILDER:
        return <AppBuilder knowledgeBase={files} />;
      case View.SETTINGS:
        return <SettingsView theme={theme} setTheme={setTheme} setMessages={setMessages} setFiles={setFiles} files={files} />;
      default:
        return <ChatContainer messages={messages} setMessages={setMessages} knowledgeBase={files} />;
    }
  };

  return (
    <div className="flex h-screen theme-bg text-zinc-100 overflow-hidden font-sans text-sm">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header currentView={currentView} />
        <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.01)_0%,_transparent_100%)]">
          {renderView()}
        </div>
        
        <div className="h-6 bg-black/60 border-t border-white/5 flex items-center px-4 justify-between text-[8px] mono text-zinc-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${files.length > 0 ? 'theme-accent-bg' : 'bg-red-500'} animate-pulse`}></span>
              {files.length > 0 ? 'neural_sovereignty_active' : 'zero_knowledge_shell'}
            </span>
            <span>total_permutations: {files.reduce((a, b) => a + b.cycles, 0).toLocaleString()}</span>
            <span className="text-emerald-500/50">brain_persistence: forever</span>
            <span>air_gapped_sim: true</span>
          </div>
          <div className="flex items-center gap-4 uppercase font-bold">
            <span className="text-[7px]">station_id: omega_aaayafuj</span>
            <span className="text-emerald-500/50 text-[7px]">owner: verified_master</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
