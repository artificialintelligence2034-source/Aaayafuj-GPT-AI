
import React, { useState, useRef, useEffect } from 'react';
import { generateVideoLocal } from '../services/gemini';
import { 
  Video, 
  Play, 
  Download, 
  RefreshCw, 
  Send, 
  Loader2, 
  Cpu, 
  Wand2,
  Monitor,
  Smartphone,
  History,
  MessageSquare,
  CornerDownLeft,
  Brain,
  ShieldAlert,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { LocalFile } from '../types';

interface VideoInteraction {
  role: 'user' | 'assistant';
  content: string;
  videoUrl?: string;
}

interface VideoLabProps {
  knowledgeBase: LocalFile[];
}

const VideoLab: React.FC<VideoLabProps> = ({ knowledgeBase }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [interactions, setInteractions] = useState<VideoInteraction[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [genStatus, setGenStatus] = useState('');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const historyScrollRef = useRef<HTMLDivElement>(null);

  // Access aistudio from window with type assertion to avoid global declaration conflicts
  const aistudio = (window as any).aistudio;

  useEffect(() => {
    checkKey();
  }, []);

  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
    }
  }, [interactions, genStatus]);

  const checkKey = async () => {
    // Check if the environment provides aistudio key selection
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const keySelected = await aistudio.hasSelectedApiKey();
      setHasKey(keySelected);
    } else {
      // Default to true if not in an environment requiring manual selection
      setHasKey(true);
    }
  };

  const handleOpenKey = async () => {
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      setHasKey(true); // Assume success per guidelines
    }
  };

  const statusMessages = [
    "Initializing Sovereign Optics...",
    "Shattering Frame Buffers...",
    "Mastering 100B Temporal Permutations...",
    "Infecting Latent Shards...",
    "Forging Chromatic Vectors...",
    "Materializing Dream State...",
    "Finalizing Neural Render..."
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setInteractions(prev => [...prev, { role: 'user', content: prompt }]);
    
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      setGenStatus(statusMessages[statusIndex % statusMessages.length]);
      statusIndex++;
    }, 4000);

    try {
      const url = await generateVideoLocal(prompt, knowledgeBase, aspectRatio);
      if (url) {
        setCurrentVideo(url);
        setInteractions(prev => [...prev, { 
          role: 'assistant', 
          content: `temporal_derivation: materialized for [${prompt}]`,
          videoUrl: url 
        }]);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      setInteractions(prev => [...prev, { role: 'assistant', content: "error: derivation void. neural link severed." }]);
    } finally {
      clearInterval(statusInterval);
      setGenStatus('');
      setIsGenerating(false);
      setPrompt('');
    }
  };

  if (hasKey === false) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-10 text-center bg-[#020202]">
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <ShieldAlert size={48} />
        </div>
        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Key Required</h2>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Veo temporal synthesis requires owner-authenticated billing. Connect a paid project to activate the Video Lab.
          </p>
          <div className="pt-6 flex flex-col gap-4">
            <button 
              onClick={handleOpenKey}
              className="bg-white text-zinc-950 px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Select Sovereign Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors"
            >
              Review Billing Protocols ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#030303] overflow-hidden relative">
      <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '80px 80px' }} />

        {currentVideo ? (
          <div className="relative w-full h-full flex items-center justify-center group">
            <video 
              src={currentVideo} 
              autoPlay 
              loop 
              controls
              className={`max-w-full max-h-full rounded-3xl shadow-[0_0_120px_rgba(0,0,0,1)] border border-white/10 animate-in zoom-in-95 duration-1000 ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`} 
            />
            <div className="absolute bottom-10 right-10 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = currentVideo!;
                  link.download = `aaayafuj-dream-${Date.now()}.mp4`;
                  link.click();
                }}
                className="flex items-center gap-4 px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-110 transition-transform"
              >
                <Download size={20} />
                Extract Shard
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-12 max-w-2xl z-10">
            <div className={`w-40 h-40 rounded-[40px] bg-zinc-900/50 border-2 border-zinc-800 mx-auto flex items-center justify-center shadow-2xl ${isGenerating ? 'animate-pulse border-emerald-500/50' : ''}`}>
              {isGenerating ? (
                <RefreshCw size={80} className="theme-accent-text animate-spin" />
              ) : (
                <Video size={80} className="text-zinc-800" />
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-zinc-100 uppercase tracking-tighter">Temporal Dream Engine</h2>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed">
                {isGenerating 
                  ? 'Compounding temporal matrices...' 
                  : 'Shatter reality into a mastered video derivation.'}
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 z-30 pointer-events-none">
          <div className="flex justify-center mb-6 gap-4 pointer-events-auto">
            <button 
              onClick={() => setAspectRatio('16:9')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === '16:9' ? 'bg-white text-black' : 'bg-black/40 text-zinc-500 border border-white/5'}`}
            >
              <Monitor size={14} /> Cinema 16:9
            </button>
            <button 
              onClick={() => setAspectRatio('9:16')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === '9:16' ? 'bg-white text-black' : 'bg-black/40 text-zinc-500 border border-white/5'}`}
            >
              <Smartphone size={14} /> Mobile 9:16
            </button>
          </div>
          
          <form 
            onSubmit={handleGenerate}
            className="bg-zinc-950/95 backdrop-blur-3xl border-2 border-zinc-800 p-4 rounded-[40px] flex gap-6 pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10"
          >
            <div className="flex items-center pl-6">
               <Wand2 size={32} className="text-zinc-700" />
            </div>
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="describe a mastered dream... 🚀"
              className="flex-1 bg-transparent border-none outline-none py-6 text-xl text-zinc-100 placeholder:text-zinc-800 font-black tracking-tight"
            />
            <button 
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="bg-zinc-100 hover:bg-white text-zinc-950 px-14 rounded-[24px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all disabled:opacity-10 group shadow-2xl hover:scale-[1.05] active:scale-95"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <>Synthesize</>}
            </button>
          </form>
        </div>
      </div>

      <div className={`${isConsoleOpen ? 'w-[450px]' : 'w-0'} bg-zinc-950 border-l border-white/5 transition-all duration-500 ease-in-out flex flex-col z-40 relative`}>
        <button 
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          className="absolute -left-12 top-10 w-12 h-12 bg-zinc-950 border border-white/5 rounded-l-2xl flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
        >
          {isConsoleOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>

        {isConsoleOpen && (
          <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
            <div className="p-10 border-b border-white/5 bg-zinc-900/10">
              <span className="text-sm font-black uppercase tracking-[0.4em] text-zinc-100 flex items-center gap-4">
                <History size={20} className="theme-accent-text" /> Temporal Shards
              </span>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
               <div ref={historyScrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth">
                  {interactions.length === 0 ? (
                    <div className="opacity-10 flex flex-col items-center justify-center h-full space-y-4">
                      <Play size={64} />
                      <p className="text-[10px] font-black uppercase tracking-[0.6em]">Awaiting Dream</p>
                    </div>
                  ) : (
                    interactions.map((i, idx) => (
                      <div key={idx} className={`space-y-4 ${i.role === 'user' ? 'border-l-2 border-zinc-800 pl-6' : 'border-l-2 border-emerald-500/40 pl-6'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${i.role === 'user' ? 'text-zinc-600' : 'text-emerald-500'}`}>
                          {i.role === 'user' ? 'Instruction' : 'Materialized'}
                        </p>
                        <p className="text-sm text-zinc-300 font-bold italic leading-relaxed">{i.content}</p>
                        {i.videoUrl && (
                          <div className="mt-4 w-full aspect-video rounded-xl overflow-hidden border border-white/5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group">
                             <video src={i.videoUrl} className="w-full h-full object-cover" onClick={() => setCurrentVideo(i.videoUrl!)} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isGenerating && (
                    <div className="space-y-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full theme-accent-bg animate-ping" />
                        <span className="text-[10px] font-black theme-accent-text uppercase tracking-widest">{genStatus}</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/50 w-1/3 animate-[loading_2s_infinite]" />
                      </div>
                    </div>
                  )}
               </div>

               <div className="p-10 border-t border-white/5 space-y-8 bg-zinc-900/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Knowledge awareness</label>
                      {knowledgeBase.length > 0 && <Brain size={14} className="text-emerald-500" />}
                    </div>
                    <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-2xl">
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Permutations Active</p>
                       <p className="text-xs text-zinc-400 font-bold">{knowledgeBase.length} Context Synapses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-black/40 border border-white/5 rounded-2xl">
                     <Cpu size={24} className="text-zinc-700" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-200 uppercase tracking-widest">Temporal VPU</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">H.265 Optimized</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default VideoLab;
