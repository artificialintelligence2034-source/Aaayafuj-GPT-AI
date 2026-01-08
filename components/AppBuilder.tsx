
import React, { useState, useRef, useEffect } from 'react';
import { 
  Code, 
  Terminal, 
  Play, 
  Layout, 
  FileCode, 
  Loader2, 
  Sparkles, 
  Eye,
  Download,
  Globe,
  Settings2,
  Activity,
  Cpu,
  Layers,
  ChevronDown,
  MessageSquare,
  History,
  CornerDownLeft,
  Brain
} from 'lucide-react';
import { getGeminiStreamResponse } from '../services/gemini';
import { BuildLanguage, BuilderTab, LocalFile } from '../types';

interface Interaction {
  role: 'user' | 'assistant';
  content: string;
}

interface AppBuilderProps {
  knowledgeBase: LocalFile[];
}

const AppBuilder: React.FC<AppBuilderProps> = ({ knowledgeBase }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BuilderTab>('CODE');
  const [selectedLang, setSelectedLang] = useState<BuildLanguage>(BuildLanguage.PYTHON);
  const [isHudExpanded, setIsHudExpanded] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when code is streaming
  useEffect(() => {
    if (codeContainerRef.current && isGenerating) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [generatedCode, isGenerating]);

  // Auto-scroll interaction history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [interactions]);

  const handleGenerateCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const currentPrompt = prompt;
    setInteractions(prev => [...prev, { role: 'user', content: currentPrompt }]);
    setPrompt('');
    setIsGenerating(true);
    setIsPublished(false);
    setActiveTab('CODE');

    try {
      const context = generatedCode 
        ? `CURRENT_CODE_CONTEXT:\n${generatedCode}\n\nUSER_NEW_INSTRUCTION: ${currentPrompt}`
        : currentPrompt;

      const history = interactions.map(i => ({ role: i.role, content: i.content }));

      const stream = getGeminiStreamResponse(context, history, knowledgeBase);
      
      let fullCode = "";
      for await (const chunk of stream) {
        const cleanedChunk = chunk.replace(/```[a-z]*\n?|```/g, '');
        fullCode += cleanedChunk;
        setGeneratedCode(fullCode);
      }

      setInteractions(prev => [...prev, { role: 'assistant', content: `Synthesis complete for: ${currentPrompt}` }]);
    } catch (error) {
      console.error("Architect Error:", error);
      setGeneratedCode("# Error: Neural interface disconnected during synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getFileExtension = () => {
    switch (selectedLang) {
      case BuildLanguage.PYTHON:
      case BuildLanguage.DESKTOP_PYSIDE: return 'py';
      case BuildLanguage.RUST: return 'rs';
      case BuildLanguage.CPP: return 'cpp';
      case BuildLanguage.SQL: return 'sql';
      default: return 'html';
    }
  };

  const downloadFile = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aaayafuj_build.${getFileExtension()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publishToLocal = () => {
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 3000);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#050505]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '50px 50px' }} />

      {/* Workspace Header */}
      <div className="h-24 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-2xl flex items-center justify-between px-10 relative z-20 shadow-xl">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Code size={28} className="text-zinc-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase tracking-[0.3em] text-zinc-100">Sovereign Architect</span>
              <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Knowledge-Aware Logic Synthesis</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-zinc-800" />
          
          <div className="flex bg-zinc-900/80 border border-zinc-800 rounded-2xl p-2 gap-2">
            <button onClick={() => setActiveTab('CODE')} className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'CODE' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <FileCode size={18} /> Source Code
            </button>
            <button onClick={() => setActiveTab('PREVIEW')} className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'PREVIEW' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Eye size={18} /> Live Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {generatedCode && (
            <>
              <button onClick={downloadFile} className="flex items-center gap-3 px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-2xl text-sm font-black uppercase tracking-widest text-zinc-300 transition-all shadow-xl">
                <Download size={20} /> Download
              </button>
              <button onClick={publishToLocal} className="flex items-center gap-3 px-6 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-sm font-black uppercase tracking-widest text-emerald-500 transition-all shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <Globe size={20} /> {isPublished ? 'STAGING...' : 'PUBLISH'}
              </button>
            </>
          )}
          <button onClick={() => setIsHudExpanded(!isHudExpanded)} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95">
            <Settings2 size={26} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor/Preview Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'CODE' ? (
            <div ref={codeContainerRef} className="flex-1 overflow-auto bg-zinc-950 p-12 mono text-[16px] leading-[1.6] selection:bg-emerald-500/40 scroll-smooth">
              {generatedCode || isGenerating ? (
                <pre className="text-emerald-400/95 whitespace-pre font-mono filter drop-shadow-[0_0_2px_rgba(52,211,153,0.3)]">
                  {generatedCode}
                  {isGenerating && <span className="inline-block w-2.5 h-6 bg-emerald-500 ml-1 animate-pulse" />}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-800 text-center space-y-8">
                  <Layout size={100} className="opacity-5" />
                  <div className="space-y-4">
                    <p className="text-xl uppercase tracking-[0.5em] font-black text-zinc-700">Architect Idle</p>
                    <p className="text-sm text-zinc-800 uppercase tracking-widest font-bold">Initiate dialogue to synthesize logic</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-zinc-900/50 p-12 flex flex-col items-center justify-center">
              {generatedCode ? (
                selectedLang === BuildLanguage.WEB_REACT ? (
                  <iframe title="Preview" srcDoc={generatedCode} className="w-full h-full bg-white rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-4 border-zinc-800 overflow-hidden" />
                ) : (
                  <div className="max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-[40px] p-16 space-y-12 text-center shadow-[0_40px_120px_rgba(0,0,0,0.9)] border-white/5">
                    <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                      <Terminal size={48} />
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-4xl font-black text-zinc-100 uppercase tracking-tighter">Build Complete</h3>
                      <p className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto font-medium">Binary optimized for local execution.</p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-zinc-700 text-lg italic uppercase tracking-[0.6em] font-black">Waiting for Synthesis...</p>
              )}
            </div>
          )}
        </div>

        {/* Floating System HUD / Interaction Log */}
        <div className={`w-[450px] border-l border-zinc-800 bg-zinc-950/95 backdrop-blur-3xl transition-all duration-500 ease-in-out flex flex-col overflow-hidden shadow-[-30px_0_60px_rgba(0,0,0,0.7)] ${isHudExpanded ? 'translate-x-0' : 'translate-x-full w-0'}`}>
           <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
             <span className="text-sm font-black uppercase tracking-[0.3em] text-zinc-100 flex items-center gap-4">
               <History size={20} className="text-emerald-500" /> Interaction Log
             </span>
             <span className="text-xs mono text-zinc-600 font-black bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/5">ARCH_v3.0</span>
           </div>

           <div className="flex-1 flex flex-col overflow-hidden">
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                {interactions.length === 0 ? (
                  <div className="opacity-20 flex flex-col items-center justify-center h-full space-y-4">
                    <MessageSquare size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">No commands logged</p>
                  </div>
                ) : (
                  interactions.map((i, idx) => (
                    <div key={idx} className={`space-y-3 ${i.role === 'user' ? 'border-l-2 border-zinc-700 pl-4' : 'border-l-2 border-emerald-500/30 pl-4'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${i.role === 'user' ? 'text-zinc-500' : 'text-emerald-500'}`}>
                        {i.role === 'user' ? 'Owner Instruction' : 'Architect Status'}
                      </p>
                      <p className="text-sm text-zinc-300 font-medium leading-relaxed italic">{i.content}</p>
                    </div>
                  ))
                )}
                {isGenerating && (
                  <div className="flex items-center gap-4 animate-pulse">
                    <Loader2 size={16} className="text-emerald-500 animate-spin" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Re-Synthesizing Logic...</span>
                  </div>
                )}
             </div>

             <div className="p-10 border-t border-zinc-800 space-y-8 bg-zinc-900/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black uppercase text-zinc-500 tracking-[0.3em]">Awareness Index</label>
                    {knowledgeBase.length > 0 && <Brain size={16} className="text-emerald-500" />}
                  </div>
                  <div className="p-4 bg-zinc-900/60 border border-emerald-500/20 rounded-2xl">
                     <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Knowledge Active</p>
                     <p className="text-xs text-zinc-300 font-bold">{knowledgeBase.length} Blocks Mapped</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-black uppercase text-zinc-500 tracking-[0.3em]">Language Profile</label>
                  <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value as BuildLanguage)} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 font-black outline-none appearance-none">
                    <option value={BuildLanguage.PYTHON}>Python (Inference Logic)</option>
                    <option value={BuildLanguage.DESKTOP_PYSIDE}>Desktop UI (Qt/PySide6)</option>
                    <option value={BuildLanguage.RUST}>Rust (Memory Safety)</option>
                    <option value={BuildLanguage.CPP}>C++ (High Throughput)</option>
                    <option value={BuildLanguage.WEB_REACT}>Modern Web (React/JS)</option>
                    <option value={BuildLanguage.SQL}>Database (Local SQL)</option>
                  </select>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Sovereign Architect Interaction Bar */}
      <div className="absolute bottom-16 left-0 right-0 max-w-6xl mx-auto px-10 pointer-events-none z-30">
        <form onSubmit={handleGenerateCode} className="bg-zinc-900/95 backdrop-blur-[40px] border-2 border-zinc-800 p-4 rounded-[32px] flex gap-6 pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-2 ring-white/5">
          <div className="flex items-center pl-4">
             <Layers size={32} className="text-zinc-600" />
          </div>
          <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={generatedCode ? "Instruct Architect: 'fix the bug', 'add styles'..." : "Describe the module..."} className="flex-1 bg-transparent border-none outline-none py-4 text-xl text-zinc-100 placeholder:text-zinc-800 font-black tracking-tight" />
          <button type="submit" disabled={isGenerating || !prompt.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-12 rounded-2xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all disabled:opacity-20 group shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-[1.05] active:scale-95">
            {isGenerating ? <Loader2 size={24} className="animate-spin" /> : (
              <>
                <CornerDownLeft size={20} className="group-hover:scale-125 transition-transform" />
                Instruction
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppBuilder;
