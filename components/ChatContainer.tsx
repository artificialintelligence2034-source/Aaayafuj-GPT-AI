
import React, { useState, useRef, useEffect } from 'react';
import { Message, LocalFile } from '../types';
import { getGeminiStreamResponse, generateTTS } from '../services/gemini';
import { 
  Send, 
  Loader2, 
  Terminal, 
  User, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Waves,
  CornerDownLeft,
  Copy,
  Check
} from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  knowledgeBase: LocalFile[];
}

// Audio Utils
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

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, setMessages, knowledgeBase }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVocalActive, setIsVocalActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join(' ');
        
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (!isManuallyStoppedRef.current && isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      isManuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      isManuallyStoppedRef.current = false;
      setInput('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setIsVocalActive(true);
      } catch (e) {
        console.error('Recognition start error:', e);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    // Strip special formatting tokens for cleaner copy
    const cleanText = text.replace(/MODE_[A-Z]+:|### \[.*?\]|### /g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = async (text: string) => {
    if (!isVocalActive) return;
    const cleanText = text.replace(/[#*`_>\[\]]/g, '').slice(0, 1000);
    const base64Audio = await generateTTS(cleanText);
    if (!base64Audio) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const renderContent = (content: string, isStreaming: boolean) => {
    const lines = content.split('\n');
    return (
      <div className="relative">
        {lines.map((line, i) => {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith('MODE_')) {
            const mode = trimmedLine.split(':')[0];
            return (
              <div key={i} className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] border border-white/5">{mode}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            );
          }

          if (trimmedLine.startsWith('# ')) {
            return <h1 key={i} className="text-4xl font-black text-white mt-6 mb-4 tracking-tighter uppercase border-b border-white/10 pb-2">{trimmedLine.replace('# ', '')}</h1>;
          }
          
          if (trimmedLine.startsWith('### [') || trimmedLine.startsWith('### ')) {
            return (
              <h3 key={i} className="text-xl font-black text-emerald-500 mt-6 mb-2 tracking-widest uppercase flex items-center gap-3">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                {trimmedLine.replace('### ', '')}
              </h3>
            );
          }

          if (trimmedLine.startsWith('## ')) {
            return <h2 key={i} className="text-2xl font-black text-zinc-100 mt-5 mb-2 tracking-tight uppercase">{trimmedLine.replace('## ', '')}</h2>;
          }

          if (trimmedLine.startsWith('* ')) {
            return <li key={i} className="ml-4 list-disc text-zinc-300 my-2 font-medium">{processInlineStyles(trimmedLine.replace('* ', ''))}</li>;
          }

          if (trimmedLine.startsWith('> ')) {
            return <blockquote key={i} className="border-l-4 border-zinc-700 pl-6 my-4 italic text-zinc-500 font-bold text-lg">{processInlineStyles(trimmedLine.replace('> ', ''))}</blockquote>;
          }

          if (trimmedLine === "") return <div key={i} className="h-4" />;
          
          return <p key={i} className="my-2 min-h-[1.2em] text-zinc-400 font-medium leading-relaxed">{processInlineStyles(trimmedLine)}</p>;
        })}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse align-middle" />
        )}
      </div>
    );
  };

  const processInlineStyles = (text: string) => {
    let parts: (string | React.ReactNode)[] = [text];

    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\[.*?\])/g);
      return subParts.map((sp, j) => {
        if (sp.startsWith('[') && sp.endsWith(']')) {
          const isReflection = sp.includes('self_reflection');
          return <span key={j} className={`text-[10px] font-black ${isReflection ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'} px-2 py-0.5 rounded border tracking-widest uppercase mx-1 align-middle`}>{sp.slice(1, -1)}</span>;
        }
        return sp;
      });
    });

    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\*\*.*?\*\*)/g);
      return subParts.map((sp, j) => sp.startsWith('**') ? <strong key={j} className="text-white font-black text-[1.05em]">{sp.slice(2, -2)}</strong> : sp);
    });

    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\|.*?\|)/g);
      return subParts.map((sp, j) => sp.startsWith('|') ? <span key={j} className="bg-red-500/20 text-red-400 px-1 rounded mx-0.5">{sp.slice(1, -1)}</span> : sp);
    });

    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\`.*?`)/g);
      return subParts.map((sp, j) => sp.startsWith('`') ? <code key={j} className="bg-zinc-800/80 px-2 py-1 rounded text-xs mono text-emerald-400 border border-white/5 mx-1">{sp.slice(1, -1)}</code> : sp);
    });

    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(/(\*.*?\*)/g);
      return subParts.map((sp, j) => sp.startsWith('*') && !sp.startsWith('**') ? <em key={j} className="italic text-zinc-500">{sp.slice(1, -1)}</em> : sp);
    });

    return parts;
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening) {
      isManuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const currentInput = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const stream = getGeminiStreamResponse(currentInput, history, knowledgeBase);
      
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: fullContent } : msg
        ));
      }

      if (isVocalActive) {
        speakText(fullContent);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId ? { ...msg, content: '# [error ❌]\n### neural_synthesis_aborted\n*the core logic engine encountered a derivation void.*', role: 'system' as any } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full px-4 md:px-8 lg:px-12">
      <div className="mt-4 flex items-center justify-between px-4 py-2 bg-black/40 border border-white/5 rounded-xl">
         <div className="flex items-center gap-3">
            <Activity size={12} className={knowledgeBase.length > 0 ? "text-emerald-500" : "text-zinc-600"} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {knowledgeBase.length > 0 ? `sovereign logic core: unfiltered_chaos_mode_active ⚡` : 'awaiting owner neural shards 🧠'}
            </span>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsVocalActive(!isVocalActive)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${isVocalActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}
              title="Toggle AI Speech"
            >
              {isVocalActive ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span className="text-[8px] font-black uppercase tracking-widest">Live Vocalization</span>
            </button>
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-zinc-800'}`}></div>
            <span className="text-[8px] mono text-zinc-600 font-bold uppercase tracking-widest">derivation_stream</span>
         </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-10 py-10 pb-40 pr-2 scrollbar-hide"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[95%] min-w-[320px] group relative rounded-3xl p-8 px-10 shadow-2xl border transition-all ${
              msg.role === 'user' 
                ? 'bg-zinc-900/40 backdrop-blur-2xl border-emerald-500/50 text-emerald-50 shadow-[0_0_50px_rgba(16,185,129,0.2)] rounded-tr-none' 
                : msg.role === 'system' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 rounded-tl-none'
                  : 'bg-zinc-950/80 backdrop-blur-md border-white/5 text-zinc-200 rounded-tl-none shadow-[0_30px_60px_rgba(0,0,0,0.7)]'
            }`}>
              {/* COPY BUTTON - AI ASSISTANT ONLY */}
              {msg.role === 'assistant' && msg.content && (
                <button 
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  className="absolute top-6 right-6 flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="Copy Neural Logic"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-zinc-500 group-hover:text-white" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">COPY LOGIC</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center justify-between gap-6 mb-8 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  {msg.role === 'user' && <User size={14} className="text-emerald-400" />}
                  {msg.role === 'assistant' && <Cpu size={14} className="text-zinc-500" />}
                  <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${msg.role === 'user' ? 'text-emerald-400' : 'opacity-40'}`}>
                    {msg.role === 'user' ? 'verified sovereign master' : msg.role === 'system' ? 'core anomaly detected' : 'aaayafuj_omega derivation'}
                  </span>
                </div>
                <span className="text-[8px] mono font-bold opacity-30">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="font-mono tracking-tight selection:bg-emerald-500 selection:text-white">
                {msg.content ? renderContent(msg.content, isLoading && msg.role === 'assistant' && msg.id === messages[messages.length-1].id) : (isLoading && msg.role === 'assistant' ? <span className="text-amber-500 animate-pulse font-black text-xs uppercase tracking-[0.3em]">Processing unfiltered atomic logic... ⚡</span> : '')}
              </div>
              
              {msg.role === 'user' && (
                <div className="mt-6 flex justify-end">
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                     <ShieldCheck size={12} className="text-emerald-400" />
                     <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Command Authorized</span>
                   </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none z-50">
        <div className="w-full px-4 md:px-8 lg:px-12 pointer-events-none">
            <form 
            onSubmit={handleSend}
            className="bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 p-4 rounded-[32px] flex items-center gap-4 pointer-events-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/10"
            >
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening to Master (Continuous)..." : "master directive: request logic synthesis... 🚀"}
                className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm text-zinc-100 placeholder:text-zinc-800 font-black uppercase tracking-[0.2em] mono"
            />
            
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={toggleListening}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isListening 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-white/5'
                }`}
                title="Continuous Voice Assistant"
              >
                {isListening ? <Waves size={20} /> : <Mic size={20} />}
              </button>
              
              <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-zinc-100 hover:bg-white text-zinc-950 px-10 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-10 shadow-2xl active:scale-95 group font-black uppercase tracking-widest text-xs gap-3"
              >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      Execute Logic
                      <CornerDownLeft size={14} className="opacity-40" />
                    </>
                  )}
              </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
