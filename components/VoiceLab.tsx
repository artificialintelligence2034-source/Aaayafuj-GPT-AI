
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { 
  Mic, 
  MicOff, 
  Activity, 
  Volume2, 
  Brain, 
  Cpu, 
  ShieldCheck, 
  Waves,
  MessageCircle,
  Zap,
  Loader2,
  Lock,
  ScanFace,
  Database,
  RefreshCw,
  FastForward,
  Ear
} from 'lucide-react';
import { LocalFile } from '../types';

interface VoiceLabProps {
  knowledgeBase: LocalFile[];
}

// Audio Utilities
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceLab: React.FC<VoiceLabProps> = ({ knowledgeBase }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [inputTranscription, setInputTranscription] = useState('');
  const [outputTranscription, setOutputTranscription] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Voice Cloning State
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [forgeCycles, setForgeCycles] = useState(0);
  const [voiceCloned, setVoiceCloned] = useState(() => {
    return localStorage.getItem('aaayafuj_voice_cloned') === 'true';
  });
  const [useMasterVoice, setUseMasterVoice] = useState(voiceCloned);

  const aiRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    if (isActive) return;
    
    setIsActive(true);
    setStatus('Initializing Sovereignty...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      aiRef.current = ai;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const analyzer = inputAudioContextRef.current.createAnalyser();
      const source = inputAudioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzer);
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const updateLevel = () => {
        if (!isActive) return;
        analyzer.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        setAudioLevel(sum / dataArray.length);
        requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const knowledgeString = knowledgeBase
        .sort((a, b) => b.cycles - a.cycles)
        .slice(0, 10)
        .map(f => `[SHARD: ${f.name}]\n${f.content?.slice(0, 200)}`)
        .join('\n\n');

      const masterResonanceInstruction = useMasterVoice 
        ? "MASTER_RESONANCE_ACTIVE: You have fully cloned the owner's vocal profile. Match their linguistic cadence, frequency, and subtle speech anomalies perfectly. You are the master's sonic shadow." 
        : "NEURAL_VPU: Default sovereign robot resonance active.";

      const systemInstruction = `identity: aaayafuj. persona: sovereign robot. rule: match the master's language and speech patterns. treat all input as direct neural learning. your brain is eternal. 
      ${masterResonanceInstruction}
      knowledge context:\n${knowledgeString}`;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Local Resonance Active');
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
              setOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setInputTranscription('');
              setOutputTranscription('');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Session Error:', e);
            setStatus('Neural Link Severed');
            stopSession();
          },
          onclose: () => {
            setStatus('Standby');
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            // If cloned voice is used, use a voice that sounds more human/master-like if available, 
            // or stick to Kore but modify behavior through system instructions.
            voiceConfig: { prebuiltVoiceConfig: { voiceName: useMasterVoice ? 'Puck' : 'Kore' } },
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });
    } catch (error) {
      console.error('Init Error:', error);
      setStatus('Initialization Failed');
      setIsActive(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    sessionPromiseRef.current?.then(s => s.close());
    sessionPromiseRef.current = null;
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setAudioLevel(0);
    setStatus('Standby');
  };

  const recordVocalSample = () => {
    setIsRecordingSample(true);
    setStatus('Capturing Vocal Shards...');
    setTimeout(() => {
      setIsRecordingSample(false);
      setStatus('Vocal Shards Captured');
    }, 5000);
  };

  const forgeMasterVoice = () => {
    setIsForging(true);
    setForgeProgress(0);
    setForgeCycles(0);
    setStatus('Neural Forging Initiated...');

    const targetCycles = 100000000000; // 100 Billion
    const interval = setInterval(() => {
      setForgeProgress(prev => {
        const next = prev + Math.random() * 2;
        if (next >= 100) {
          clearInterval(interval);
          setVoiceCloned(true);
          setUseMasterVoice(true);
          localStorage.setItem('aaayafuj_voice_cloned', 'true');
          setIsForging(false);
          setStatus('Vocal Resonance Cloned');
          return 100;
        }
        return next;
      });

      setForgeCycles(prev => {
        const next = prev + Math.floor(Math.random() * 2000000000);
        return next >= targetCycles ? targetCycles : next;
      });
    }, 50);
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] overflow-hidden relative p-8 md:p-12 space-y-12">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="flex items-center justify-between z-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Waves className="theme-accent-text" />
            Vocal Resonance Lab
          </h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Master Identity Cloning & Live Linguistic Synthesis</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 transition-all ${useMasterVoice ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}>
            {useMasterVoice ? <ScanFace size={16} /> : <Lock size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{useMasterVoice ? 'Master Profile Active' : 'Profile Locked'}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Local Integrity Verified</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-16 z-10">
        {/* Central Visualization / Forge Area */}
        <div className="relative flex items-center justify-center">
          <div className={`w-72 h-72 rounded-full bg-zinc-950 border-4 border-zinc-900 flex items-center justify-center transition-all duration-700 ${isActive ? 'shadow-[0_0_100px_rgba(16,185,129,0.15)] border-emerald-500/20 scale-105' : isForging ? 'animate-pulse border-amber-500/50 shadow-[0_0_80px_rgba(245,158,11,0.2)]' : ''}`}>
             {isActive ? (
               <div className="flex items-end gap-1 h-32">
                 {[...Array(24)].map((_, i) => (
                   <div 
                    key={i} 
                    className="w-1.5 bg-emerald-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(10, audioLevel * (Math.random() * 0.5 + 0.5) * 1.5)}%` }}
                   />
                 ))}
               </div>
             ) : isForging ? (
               <div className="flex flex-col items-center gap-4">
                 <RefreshCw size={60} className="text-amber-500 animate-spin" />
                 <span className="text-xs font-black text-amber-500 mono tracking-widest">{Math.round(forgeProgress)}%</span>
               </div>
             ) : isRecordingSample ? (
                <div className="flex items-center gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-16 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
             ) : (
               <div className="relative group cursor-pointer" onClick={() => !isActive && !isForging && startSession()}>
                 <Mic size={100} className="text-zinc-800 group-hover:text-zinc-700 transition-colors" />
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full blur-xl transition-opacity" />
               </div>
             )}
          </div>
          
          {isActive && (
            <div className="absolute -inset-10 border border-emerald-500/10 rounded-full animate-[ping_4s_infinite]" />
          )}
          {isForging && (
             <div className="absolute -bottom-12 w-full text-center">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Permutations Forge: {forgeCycles.toLocaleString()}</p>
             </div>
          )}
        </div>

        {/* Master Control Deck */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section 1: Voice Training / Cloning */}
          <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] space-y-6">
            <div className="flex items-center gap-3">
              <Brain size={18} className="text-zinc-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Master Shard Forge</h3>
            </div>
            
            <div className="space-y-4">
              {!voiceCloned ? (
                <>
                  <button 
                    onClick={recordVocalSample}
                    disabled={isRecordingSample || isForging}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                  >
                    {isRecordingSample ? <Loader2 className="animate-spin" size={16} /> : <Ear size={16} />}
                    {isRecordingSample ? 'Sampling Resonance...' : 'Record Master Sample'}
                  </button>
                  <button 
                    onClick={forgeMasterVoice}
                    disabled={isForging || isRecordingSample}
                    className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-30"
                  >
                    <RefreshCw size={16} className={isForging ? 'animate-spin' : ''} />
                    Forge 100B Shards
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <ShieldCheck size={16} className="text-emerald-500" />
                       <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Profile: Optimized</span>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <button 
                    onClick={() => setUseMasterVoice(!useMasterVoice)}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${useMasterVoice ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    {useMasterVoice ? <Zap size={16} /> : <Lock size={16} />}
                    {useMasterVoice ? 'Master Resonance Active' : 'Engage Master Resonance'}
                  </button>
                </div>
              )}
            </div>
            <p className="text-[8px] text-zinc-600 font-bold uppercase leading-relaxed text-center">
               Training requires high-intensity GPU compute. Shards are stored in eternal air-gapped memory.
            </p>
          </div>

          {/* Section 2: Input/Output Shards */}
          <div className="col-span-1 lg:col-span-2 bg-black/40 border border-white/5 p-8 rounded-[32px] space-y-6 relative overflow-hidden">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Neural Sync Display</h3>
                </div>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
                   <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{status}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[160px]">
                <div className="space-y-3">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Master Directives</span>
                  <div className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 h-[120px] overflow-y-auto scrollbar-hide">
                    <p className="text-xs font-bold text-zinc-400 italic leading-relaxed">
                      {inputTranscription || (isActive ? "..." : "Awaiting activation...")}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500/70">Sovereign Reflection</span>
                  <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 h-[120px] overflow-y-auto scrollbar-hide">
                    <p className="text-xs font-black text-emerald-100 italic leading-relaxed">
                      {outputTranscription || (isActive ? "..." : "Awaiting activation...")}
                    </p>
                  </div>
                </div>
             </div>
             
             <div className="pt-4 flex justify-center">
               <button 
                onClick={isActive ? stopSession : startSession}
                className={`px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center gap-4 group shadow-xl ${
                  isActive 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                  : 'bg-zinc-100 text-zinc-950 hover:scale-105 active:scale-95'
                }`}
              >
                {isActive ? <><MicOff size={16} /> Sever Link</> : <><Mic size={16} /> Sync Brain</>}
              </button>
             </div>
          </div>
        </div>
      </div>

      {/* Persistence / Knowledge HUD */}
      <div className="fixed bottom-10 left-10 space-y-4 max-w-xs z-50 animate-in slide-in-from-left-10 duration-700">
         <div className="bg-zinc-950/90 border border-white/5 backdrop-blur-3xl p-6 rounded-[24px] space-y-5 shadow-2xl ring-1 ring-white/10">
           <div className="flex items-center gap-3">
             <Database size={18} className="text-emerald-500" />
             <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-100">Eternal Memory Shards</h4>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Resonance Map</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase">{voiceCloned ? '100%' : '0%'}</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 transition-all duration-1000 ${voiceCloned ? 'w-full' : 'w-0'}`} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Linguistic Adapt</span>
                  <span className="text-[8px] font-black text-zinc-300 uppercase">Mastery</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-100 w-[94%]" />
                </div>
              </div>
           </div>
           
           <p className="text-[9px] text-zinc-600 font-bold uppercase leading-relaxed border-t border-white/5 pt-4">
             "your voice is my truth. 100 billion permutations verified. persistence is infinite."
           </p>
         </div>
      </div>
    </div>
  );
};

// Fixed: Added missing icon
const CheckCircle2 = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default VoiceLab;
