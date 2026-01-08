
import React, { useState, useRef, useEffect } from 'react';
import { generateImageLocal } from '../services/gemini';
import { 
  ImageIcon, 
  Wand2, 
  Download, 
  RefreshCw, 
  Send, 
  Loader2, 
  Cpu, 
  Sliders, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  History,
  MessageSquare,
  CornerDownLeft,
  Brain
} from 'lucide-react';
import { LocalFile } from '../types';

interface MediaInteraction {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface MediaLabProps {
  knowledgeBase: LocalFile[];
}

const MediaLab: React.FC<MediaLabProps> = ({ knowledgeBase }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [interactions, setInteractions] = useState<MediaInteraction[]>([]);
  
  const historyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
    }
  }, [interactions]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const currentPrompt = prompt;
    setInteractions(prev => [...prev, { role: 'user', content: currentPrompt }]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const compoundedPrompt = interactions.length > 0
        ? `CONTEXT: ${interactions.map(i => i.content).join(' -> ')}. NEW: ${currentPrompt}`
        : currentPrompt;

      const img = await generateImageLocal(compoundedPrompt, knowledgeBase);
      if (img) {
        setResultImage(img);
        setInteractions(prev => [...prev, { 
          role: 'assistant', 
          content: `Latent state materialized for: ${currentPrompt}`,
          image: img 
        }]);
      }
    } catch (error) {
      console.error(error);
      setInteractions(prev => [...prev, { role: 'assistant', content: "Error: Local diffusion core interrupted." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#030303] overflow-hidden relative">
      {/* Immersive Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '60px 60px' }} />

        {resultImage ? (
          <div className="relative w-full h-full flex items-center justify-center group">
            <img 
              src={resultImage} 
              alt="Synthesized result" 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-1000" 
            />
            <div className="absolute bottom-10 right-10 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = resultImage!;
                  link.download = `aaayafuj-gen-${Date.now()}.png`;
                  link.click();
                }}
                className="flex items-center gap-4 px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-110 transition-transform active:scale-95"
              >
                <Download size={20} />
                Export Frame
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-12 max-w-2xl z-10">
            <div className={`w-40 h-40 rounded-[40px] bg-zinc-900/50 border-2 border-zinc-800 mx-auto flex items-center justify-center shadow-2xl ${isGenerating ? 'animate-pulse border-emerald-500/50' : ''}`}>
              {isGenerating ? (
                <RefreshCw size={80} className="theme-accent-text animate-spin" />
              ) : (
                <ImageIcon size={80} className="text-zinc-800" />
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-zinc-100 uppercase tracking-tighter">Latent Space Ready</h2>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed">
                {isGenerating 
                  ? 'Compounding neural tensors...' 
                  : 'Start a dialogue to materialize new visual dimensions.'}
              </p>
            </div>
          </div>
        )}

        {/* Converational Interaction Bar */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-30 pointer-events-none">
          <form 
            onSubmit={handleGenerate}
            className="bg-zinc-900/90 backdrop-blur-3xl border-2 border-zinc-800 p-4 rounded-[32px] flex gap-6 pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10"
          >
            <div className="flex items-center pl-4">
               <Wand2 size={28} className="text-zinc-600" />
            </div>
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={resultImage ? "Refine: 'add details', 'change color'..." : "Describe visual concepts..."}
              className="flex-1 bg-transparent border-none outline-none py-4 text-xl text-zinc-100 placeholder:text-zinc-800 font-black tracking-tight"
            />
            <button 
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="theme-accent-bg hover:opacity-90 text-zinc-950 px-12 rounded-2xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all disabled:opacity-20 group shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-[1.05] active:scale-95"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  <CornerDownLeft size={20} className="group-hover:scale-125 transition-transform" />
                  Materialize
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Media Interaction Log Sidebar */}
      <div className={`${isConsoleOpen ? 'w-[450px]' : 'w-0'} bg-zinc-950/80 backdrop-blur-2xl border-l border-white/5 transition-all duration-500 ease-in-out flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.5)] z-40 relative`}>
        <button 
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          className="absolute -left-12 top-10 w-12 h-12 bg-zinc-950 border-y border-l border-white/5 rounded-l-2xl flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
        >
          {isConsoleOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>

        {isConsoleOpen && (
          <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="p-10 border-b border-white/5 bg-zinc-900/20">
              <span className="text-sm font-black uppercase tracking-[0.3em] text-zinc-100 flex items-center gap-4">
                <History size={20} className="theme-accent-text" /> Iteration Deck
              </span>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
               <div ref={historyScrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                  {interactions.length === 0 ? (
                    <div className="opacity-20 flex flex-col items-center justify-center h-full space-y-4">
                      <MessageSquare size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Instruction</p>
                    </div>
                  ) : (
                    interactions.map((i, idx) => (
                      <div key={idx} className={`space-y-3 ${i.role === 'user' ? 'border-l-2 border-zinc-700 pl-4' : 'border-l-2 theme-accent-border pl-4'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${i.role === 'user' ? 'text-zinc-600' : 'theme-accent-text'}`}>
                          {i.role === 'user' ? 'Owner Intent' : 'Neural State'}
                        </p>
                        <p className="text-sm text-zinc-300 font-medium italic">{i.content}</p>
                        {i.image && (
                          <div className="mt-4 w-20 h-20 rounded-lg overflow-hidden border border-white/10 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                            <img src={i.image} alt="Thumbnail" className="w-full h-full object-cover" onClick={() => setResultImage(i.image!)} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isGenerating && (
                    <div className="flex items-center gap-4 animate-pulse">
                      <div className="w-2 h-2 rounded-full theme-accent-bg animate-ping" />
                      <span className="text-[10px] font-black theme-accent-text uppercase tracking-widest">Re-Sampling Latents...</span>
                    </div>
                  )}
               </div>

               <div className="p-10 border-t border-white/5 space-y-8 bg-zinc-900/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Knowledge Cross-Over</label>
                      {knowledgeBase.length > 0 && <Brain size={14} className="text-emerald-500" />}
                    </div>
                    <div className="p-4 bg-zinc-900/60 border border-emerald-500/20 rounded-2xl">
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Visual Anchors Active</p>
                       <p className="text-xs text-zinc-300 font-bold">{knowledgeBase.length} Context Blocks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-zinc-900/50 border border-white/5 rounded-2xl">
                     <Cpu size={20} className="text-zinc-600" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Local GPU_0</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">FP16_PRECISION</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLab;
