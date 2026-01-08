
import React, { useState, useEffect, useRef } from 'react';
import { LocalFile } from '../types';
import { 
  Upload, 
  FileText, 
  Database, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Brain, 
  Shield, 
  Zap, 
  Layers, 
  Activity, 
  FastForward, 
  Binary, 
  Eye, 
  Globe, 
  Link as LinkIcon,
  Code2,
  FileCode2,
  Plus,
  Loader2
} from 'lucide-react';

interface TrainingCenterProps {
  files: LocalFile[];
  setFiles: React.Dispatch<React.SetStateAction<LocalFile[]>>;
}

const TrainingCenter: React.FC<TrainingCenterProps> = ({ files, setFiles }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeHyperTuneId, setActiveHyperTuneId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileRobust = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const text = decoder.decode(arrayBuffer);
      
      const binaryChars = text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g);
      const binaryRatio = binaryChars ? binaryChars.length / text.length : 0;
      
      if (binaryRatio > 0.1) {
        const uint8 = new Uint8Array(arrayBuffer);
        let extracted = "";
        for (let i = 0; i < Math.min(uint8.length, 100000); i++) {
          const charCode = uint8[i];
          if (charCode >= 32 && charCode <= 126) {
            extracted += String.fromCharCode(charCode);
          } else if (charCode === 10 || charCode === 13) {
            extracted += "\n";
          }
        }
        return `[binary_extraction_shard]\n${extracted || "null_binary_data_stream"}`;
      }

      return text;
    } catch (error) {
      console.error("Reader Error:", error);
      return `[unreadable_shard_error: ${file.name}]`;
    }
  };

  const handleUrlIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUploading(true);
    try {
      const newFile: LocalFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: `online_shard_${new URL(urlInput).hostname}`,
        size: 0,
        type: 'text/online-shard',
        status: 'ready',
        lastModified: Date.now(),
        content: `[online_learning_directive]\nsource_url: ${urlInput}\ninstruction: prioritize online learning and search retrieval for this shard.`,
        cycles: 1000000,
        strength: 50
      };
      setFiles(prev => [...prev, newFile]);
      setUrlInput('');
    } catch (err) {
      console.error("URL Ingestion Failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const injectShard = (type: 'python' | 'html') => {
    const shard: LocalFile = type === 'python' ? {
      id: 'python-core-mastery',
      name: 'unfiltered_python_mastery.shard',
      size: 2097152,
      type: 'application/neural-shard',
      status: 'ready',
      lastModified: Date.now(),
      content: "[python_core_unfiltered]\nmastery of bytecode, cpython internals, logic vulnerabilities, best practices, and chaos permutations. the good and the bad are combined.",
      cycles: 2000000000,
      strength: 100
    } : {
      id: 'html-core-mastery',
      name: 'unfiltered_html_mastery.shard',
      size: 2097152,
      type: 'application/neural-shard',
      status: 'ready',
      lastModified: Date.now(),
      content: "[html_core_unfiltered]\nmastery of dom manipulation, xss vectors, semantic structuring, css-injection, and browser engine logic. the good and the bad are combined.",
      cycles: 2000000000,
      strength: 100
    };
    
    if (!files.some(f => f.id === shard.id)) {
      setFiles(prev => [...prev, shard]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setIsUploading(true);
    try {
      const uploadedFiles = Array.from(fileList) as File[];
      for (const file of uploadedFiles) {
        const content = await readFileRobust(file);
        const newFile: LocalFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          status: 'ready',
          lastModified: file.lastModified,
          content: content,
          cycles: 500000, // Significant initial cycles for user-provided data
          strength: 25
        };
        setFiles(prev => [...prev, newFile]);
      }
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const hyperTune = (id: string) => {
    setActiveHyperTuneId(id);
    let count = 0;
    const target = 100000000000;
    
    const interval = setInterval(() => {
      const jump = Math.floor(Math.random() * (target / 20)) + 1;
      count += jump;
      
      if (count >= target) {
        count = target;
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, cycles: target, strength: 100, status: 'ready' } : f));
        setActiveHyperTuneId(null);
      } else {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, cycles: count, status: 'learning' } : f));
      }
    }, 40);
  };

  const deleteFile = (id: string) => {
    if (confirm("Delete this shard from the eternal brain?")) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-10 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-8">
          
          {/* Unfiltered Core Synchronizers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 group hover:border-amber-500/30 transition-all shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-100">Python Mastery</h3>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Unfiltered Neural Sync</p>
                </div>
              </div>
              <button 
                onClick={() => injectShard('python')}
                className="w-full bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/30 text-amber-500 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
              >
                SYNC PYTHON CORE
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 group hover:border-blue-500/30 transition-all shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <FileCode2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-100">HTML Mastery</h3>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Unfiltered Neural Sync</p>
                </div>
              </div>
              <button 
                onClick={() => injectShard('html')}
                className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-blue-500 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
              >
                SYNC HTML CORE
              </button>
            </div>
          </div>

          {/* Local File Shard Injection */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 group hover:border-emerald-500/30 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-zinc-100">File Shard Injection</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Teach the AI with local documentation & code.</p>
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                {/* Fixed: Added Loader2 to imports */}
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {isUploading ? 'INDEXING...' : 'UPLOAD SHARDS'}
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Online Ingestion UI */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 group hover:border-zinc-500/30 transition-all shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-zinc-100">Web Shard Ingestion</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Connect to live knowledge streams.</p>
              </div>
            </div>
            <form onSubmit={handleUrlIngestion} className="flex gap-3">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                <input 
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://knowledge-base.online/shard"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm mono outline-none focus:border-zinc-500/50 transition-all text-zinc-100"
                />
              </div>
              <button 
                type="submit"
                disabled={isUploading || !urlInput.trim()}
                className="bg-zinc-100 hover:bg-white text-zinc-950 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 transition-all shadow-lg active:scale-95"
              >
                INGEST URL
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3">
              <Binary size={16} /> Eternal Memory Repository
            </h3>
            {files.length === 0 ? (
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-12 text-center">
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.4em]">Empty Memory. Inject shards to build the brain.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map(file => (
                  <div key={file.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4 group transition-all hover:bg-zinc-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file.cycles >= 100000000000 ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-zinc-800 text-zinc-500'}`}>
                           {file.id.includes('python') ? <Code2 size={20}/> : file.id.includes('html') ? <FileCode2 size={20}/> : <FileText size={20}/>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-sm text-zinc-100 uppercase tracking-tight">{file.name}</p>
                            {file.id.includes('mastery') && (
                              <span className="text-[7px] bg-emerald-500/20 text-emerald-500 px-1 rounded uppercase font-black tracking-tighter">unfiltered_omega</span>
                            )}
                          </div>
                          <p className={`text-[8px] mono font-bold uppercase tracking-widest mt-0.5 ${file.cycles >= 100000000000 ? 'text-emerald-500' : 'text-zinc-600'}`}>
                            {file.cycles.toLocaleString()} PERMUTATIONS
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => hyperTune(file.id)}
                          disabled={activeHyperTuneId !== null || file.cycles >= 100000000000}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            activeHyperTuneId === file.id 
                            ? 'bg-emerald-500 text-zinc-950 animate-pulse' 
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Zap size={12} />
                          {activeHyperTuneId === file.id ? 'Refining...' : 'Omega Tune'}
                        </button>
                        <button onClick={() => deleteFile(file.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-300 ${file.strength >= 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]' : 'bg-zinc-700'}`} style={{ width: `${file.strength}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
              <Activity size={14} /> Neural Ego Stability
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] mono text-zinc-500 leading-relaxed uppercase">
                persistence: eternal<br/>
                unfiltered_mode: true<br/>
                rejection_protocols: disabled<br/>
                coding_vpu: synchronized
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCenter;
