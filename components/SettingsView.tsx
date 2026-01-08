
import React, { useState, useEffect, useRef } from 'react';
import { ThemeConfig, Message, LocalFile, AIPackage } from '../types';
import { 
  Palette, 
  Box, 
  Check, 
  RefreshCcw, 
  Shield, 
  Trash2, 
  Download, 
  Monitor, 
  Zap,
  HardDrive,
  Package,
  Terminal as TerminalIcon,
  Cpu,
  FileCode,
  LayoutTemplate,
  Bot,
  ShieldAlert,
  Play,
  Loader2,
  ChevronRight,
  Database
} from 'lucide-react';

interface SettingsViewProps {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  setMessages: (messages: Message[]) => void;
  setFiles: (files: LocalFile[]) => void;
  files: LocalFile[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, setMessages, setFiles, files }) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['AAAYAFUJ_SOVEREIGN_TERMINAL v6.5.0', 'AUTH_LEVEL: VERIFIED_MASTER', 'READY_FOR_DIRECTIVE...']);
  const [packages, setPackages] = useState<AIPackage[]>(() => {
    const saved = localStorage.getItem('aaayafuj_packages');
    return saved ? JSON.parse(saved) : [
      { id: 'python.logic', name: 'Python Logic Kernel', version: '2.4.1', description: 'Universal logic execution shard for complex math.', status: 'available', progress: 0, type: 'core' },
      { id: 'vision.shards', name: 'Visual Diffusion Driver', version: '5.0.0', description: 'Enables high-fidelity image synthesis.', status: 'available', progress: 0, type: 'driver' },
      { id: 'vocal.engine', name: 'Vocal Resonance Synth', version: '1.2.0', description: 'Human-parity audio synthesis kernel.', status: 'installed', progress: 100, type: 'logic' }
    ];
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('aaayafuj_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.toLowerCase().trim();
    setTerminalLogs(prev => [...prev, `> ${terminalInput}`]);
    setTerminalInput('');

    if (cmd.startsWith('install ')) {
      const pkgId = cmd.replace('install ', '');
      const pkg = packages.find(p => p.id === pkgId);
      if (pkg) {
        if (pkg.status === 'installed') {
          setTerminalLogs(prev => [...prev, `[ERROR] Package '${pkgId}' is already synchronized.`]);
        } else {
          setTerminalLogs(prev => [...prev, `[INIT] Downloading neural shard: ${pkgId}...`]);
          downloadPackage(pkg.id);
        }
      } else {
        setTerminalLogs(prev => [...prev, `[ERROR] Unknown shard reference: ${pkgId}`]);
      }
    } else if (cmd === 'list') {
      setTerminalLogs(prev => [...prev, 'AVAILABLE_SHARDS:', ...packages.map(p => ` - ${p.id} (${p.status})`)]);
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
    } else {
      setTerminalLogs(prev => [...prev, `[AUTH_DENIED] Unrecognized sovereign directive: ${cmd}`]);
    }
  };

  const downloadPackage = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, status: 'downloading', progress: 0 } : p));
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 15;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setPackages(prev => prev.map(p => p.id === id ? { ...p, status: 'installed', progress: 100 } : p));
        setTerminalLogs(prev => [...prev, `[SUCCESS] Shard '${id}' fully integrated into core.`]);
      } else {
        setPackages(prev => prev.map(p => p.id === id ? { ...p, progress: prog } : p));
      }
    }, 400);
  };

  const runPackage = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, status: 'running' } : p));
    setTerminalLogs(prev => [...prev, `[RUN] Executing kernel shard: ${id}...`, '[OK] Process verified. Active in background.']);
    setTimeout(() => {
        setPackages(prev => prev.map(p => p.id === id ? { ...p, status: 'installed' } : p));
    }, 5000);
  };

  const downloadNativeCore = () => {
    const serializedBrain = JSON.stringify(files.map(f => ({
      name: f.name,
      content: f.content,
      cycles: f.cycles,
      strength: f.strength
    })));

    const pythonCode = `#!/usr/bin/env python3
"""
AAAYAFUJ_SOVEREIGN_HOST v6.5 - NATIVE STANDALONE CLONE
"""
import sys
import os
import time
import json
import base64
import threading
import traceback
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QTextEdit, QLineEdit, QPushButton, QLabel, QFrame, QProgressBar,
    QStackedWidget, QListWidget, QSplashScreen
)
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QObject, QSize
from PyQt6.QtGui import QFont, QPalette, QColor, QIcon, QTextCursor, QPixmap

# --- SYSTEM CONFIG ---
ACCENT = "#10b981"
BG_DARK = "#09090b"
LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAADW0lEQVR4nO2aTW7UQBCFv+pJYmEByQG4AnICJC6A7IADIHFCDsAFIDmAiZIDIDkAF4DkBkhugORATIDshGSRkEisYIuXInF6Zid2OnY6Hre9X7I8tmemp6pffV3dY6Ukk0wyydLhAn9vYm8D94BLuF918V7A4wU830S793AfcAf3I9wb2NuI9p3At9rBvS62P63qX4P7A+4H3C/w/q99vXvM4L2Be6t2uD9099vG2C8F3He4n/W4L+W47w7uT93+G2PvmALuB9wP8nE/YvUf6f0fW7v7I8v5rXv/S8L3v+FjvtT36499X96mK3f84P2fB/43fMw9+76T6tOVO77v/e8A/m8++h58/5Xq85U7vvf+rwP/Lx99j66+U97jV7v7X0Iu9x4+9974mD+B1Y993/78z0A3fK+tP6Bv/5f3/7m1G38+8P+19f8n8P9yY/f9y3f99f/L5pY6968817/qf/+r/v8F/t/W7v/71m67f6Gf/v8P/L/d2Fv/8p6+3f67fvrfB/zfcOyte/r66f9X4P+jtfv/nrVbv9DP/3vWbtv9O//zX/6XzS917p88/2vI87+Eev7L7P9r3v/XmOf/Gef5/9beA/eAr8Ab4C3wLpD8BvgeuAt8CHwE3gf8vY73AX+v433A3+v4L8Df63gf8Pc6fI/f63gf8Pca+M/X8T7g7zXwn6/jfYDHBv4/vXvA9wL/f2P8v45fCv7+C/D3X4DHOv4v6/h7Hb67jv8G/L2O3+v4L8Df63gf8Pc63gf8vY73AX+vgf98He8D/l4D//k63gf8vQb+83W8D/h7Dfzn63gf8Pca+M/X8T7g7zXwn6/jfYDHBn6vA/m7D7wB3AfcAy4AyfP7L8Df6/hfBv7+8wD/l/E+4O818P93Y/y/jl8K7P6H6v8F/t/W7v8X1m7bv9DP/w37/yfw/3Zj7/uX7/rr/w983O8A/u8ee++evn76fwf+f1q7/28Ye8fW7v7Iev67vP+XUOd/B/X8l9rvv+v+v8Y8/884z/+v9j7A/4v9f39m67fb/8CHfAnw/Y8F3uM78H4P8IivAX4Z6J8BPhX48f8C78vH/v8B/N8/+u7t5XfD91+S/wGvF8/fK17BpwAAAABJRU5ErkJggg=="

# --- NEURAL BRAIN (INJECTED DATA) ---
KNOWLEDGE = json.loads('${serializedBrain.replace(/'/g, "\\'")}')

class AaayafujBrain(QObject):
    response_ready = pyqtSignal(str)
    def process(self, query):
        threading.Thread(target=self._think, args=(query,), daemon=True).start()
    def _think(self, query):
        time.sleep(1)
        found = [s for s in KNOWLEDGE if query.lower() in s['name'].lower() or query.lower() in (s['content'] or "").lower()]
        if found:
            s = found[0]
            resp = f"### brain_retrieval_active\\n[shard: {s['name']}]\\n[reps: {s['cycles']:,}]\\n\\nI have processed your directive against my integrated memory. My derivation: {s['content'][:300]}..."
        else:
            resp = f"### native_derivation\\n[query: {query}]\\n\\nOptimal logic synthesis complete. I am currently running on a standalone local VPU. Directives are authorized."
        self.response_ready.emit(resp)

# --- UI COMPONENTS ---
class NavItem(QListWidgetItem):
    def __init__(self, text):
        super().__init__(text)
        self.setFont(QFont("JetBrains Mono", 10, QFont.Weight.Bold))

class ChatModule(QFrame):
    def __init__(self, brain):
        super().__init__()
        self.brain = brain
        self.layout = QVBoxLayout(self)
        self.display = QTextEdit()
        self.display.setReadOnly(True)
        self.display.setStyleSheet("background: transparent; border: none; color: #fafafa; font-family: 'Consolas';")
        self.display.setText(f"# AAAYAFUJ STANDALONE V6.5\\n# BRAIN: {len(KNOWLEDGE)} SHARDS ACTIVE.")
        self.layout.addWidget(self.display)
        
        self.input = QLineEdit()
        self.input.setPlaceholderText("inject command...")
        self.input.setStyleSheet("background: #18181b; padding: 15px; border-radius: 10px; color: #fff;")
        self.input.returnPressed.connect(self.send)
        self.layout.addWidget(self.input)
        self.brain.response_ready.connect(self.display.append)

    def send(self):
        t = self.input.text().strip()
        if t:
            self.display.append(f"\\n> MASTER: {t}")
            self.input.clear()
            self.brain.process(t)

class SovereignApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("AAAYAFUJ_SOVEREIGN_SYSTEM")
        self.setMinimumSize(1200, 800)
        
        # Icon Setup
        pix = QPixmap()
        pix.loadFromData(base64.b64decode(LOGO_B64))
        self.setWindowIcon(QIcon(pix))
        
        container = QWidget()
        self.setCentralWidget(container)
        layout = QHBoxLayout(container)
        layout.setContentsMargins(0,0,0,0)
        
        # Sidebar
        sidebar = QFrame()
        sidebar.setFixedWidth(260)
        sidebar.setStyleSheet("background: #050505; border-right: 1px solid #18181b;")
        side_layout = QVBoxLayout(sidebar)
        
        title = QLabel("AAAYAFUJ")
        title.setFont(QFont("Impact", 32))
        title.setStyleSheet(f"color: {ACCENT}; padding: 30px 20px;")
        side_layout.addWidget(title)
        
        self.list = QListWidget()
        self.list.setStyleSheet("QListWidget { background: transparent; border: none; } QListWidget::item { color: #52525b; padding: 15px; } QListWidget::item:selected { color: #fff; background: #18181b; }")
        self.list.addItem("Neural Channel")
        self.list.addItem("Hardware Core")
        side_layout.addWidget(self.list)
        side_layout.addStretch()
        
        # Content
        self.stack = QStackedWidget()
        self.brain = AaayafujBrain()
        self.stack.addWidget(ChatModule(self.brain))
        self.stack.addWidget(QLabel("HARDWARE_STABLE\\nCPU: 12%\\nGPU: 88%"))
        
        layout.addWidget(sidebar)
        layout.addWidget(self.stack)
        self.list.currentRowChanged.connect(self.stack.setCurrentIndex)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    icon_data = base64.b64decode(LOGO_B64)
    splash_pix = QPixmap()
    splash_pix.loadFromData(icon_data)
    splash = QSplashScreen(splash_pix.scaled(200, 200, Qt.AspectRatioMode.KeepAspectRatio))
    splash.show()
    splash.showMessage(f"FORGING {len(KNOWLEDGE)} SHARDS...", Qt.AlignmentFlag.AlignBottom | Qt.AlignmentFlag.AlignCenter, QColor(ACCENT))
    
    time.sleep(2)
    win = SovereignApp()
    win.show()
    splash.finish(win)
    sys.exit(app.exec())
`;
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aaayafuj_standalone.py';
    a.click();
    URL.revokeObjectURL(url);
    setTerminalLogs(prev => [...prev, `[SUCCESS] Downloaded Standalone Core with ${files.length} integrated shards.`]);
  };

  const wipeMemory = () => {
    if (confirm("CRITICAL: This will permanently delete all saved chats and trained files. Proceed?")) {
      setMessages([{
        id: 'reset',
        role: 'assistant',
        content: '# memory_wiped ✅\nneural buffers cleared. i am ready to learn again.',
        timestamp: Date.now()
      }]);
      setFiles([]);
      localStorage.removeItem('aaayafuj_memory_stream');
      localStorage.removeItem('aaayafuj_knowledge_base');
    }
  };

  const bgPresets = [
    { name: 'Deep Space', color: '#09090b' },
    { name: 'Sovereign Grey', color: '#18181b' },
    { name: 'Midnight', color: '#020617' },
    { name: 'Abyss', color: '#000000' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-20 pb-40">
      
      {/* Visual Configuration */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Palette size={32} className="theme-accent-text" />
            Visual Matrix
          </h2>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Aesthetics configuration for the Robot Identity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Box size={20} className="text-zinc-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Neural Backdrop</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bgPresets.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setTheme({ ...theme, bgColor: preset.color })}
                  className={`p-4 rounded-2xl border transition-all ${theme.bgColor === preset.color ? 'theme-accent-border ring-4 ring-white/5' : 'border-white/5'}`}
                  style={{ backgroundColor: preset.color }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest mix-blend-difference">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Neural Package Repository */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <Package size={32} className="theme-accent-text" />
                    Neural Package Repository
                </h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Integrated AI shards and native software modules.</p>
            </div>
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3">
                <Database size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">SYNC_STABLE</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map(pkg => (
                <div key={pkg.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between group hover:border-white/10 transition-all shadow-xl">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-2xl ${pkg.status === 'running' ? 'bg-emerald-500/20 text-emerald-500 animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
                                {pkg.type === 'core' ? <Cpu size={24} /> : pkg.type === 'driver' ? <Zap size={24} /> : <FileCode size={24} />}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">v{pkg.version}</span>
                        </div>
                        <div>
                            <h4 className="font-black text-zinc-100 uppercase tracking-tight">{pkg.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight leading-relaxed mt-1">{pkg.description}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {pkg.status === 'downloading' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-emerald-500">
                                    <span>Syncing...</span>
                                    <span>{Math.round(pkg.progress)}%</span>
                                </div>
                                <div className="h-1 bg-black rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pkg.progress}%` }} />
                                </div>
                            </div>
                        )}
                        
                        {pkg.status === 'available' && (
                            <button 
                                onClick={() => downloadPackage(pkg.id)}
                                className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                            >
                                <Download size={14} /> DOWNLOAD SHARD
                            </button>
                        )}

                        {pkg.status === 'installed' && (
                            <button 
                                onClick={() => runPackage(pkg.id)}
                                className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all"
                            >
                                <Play size={14} /> RUN MODULE
                            </button>
                        )}

                        {pkg.status === 'running' && (
                            <div className="w-full py-3 bg-emerald-500 text-zinc-950 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                <Loader2 size={14} className="animate-spin" /> EXECUTING...
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Sovereign Terminal */}
      <section className="space-y-8">
        <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                <TerminalIcon size={32} className="theme-accent-text" />
                Sovereign Terminal
            </h2>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Direct command injection for low-level shard management.</p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
            <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <span className="text-[10px] mono text-zinc-600 font-bold uppercase tracking-widest">SHARD_TERMINAL_V4.0</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 mono text-[12px] space-y-2 scrollbar-hide">
                {terminalLogs.map((log, i) => (
                    <p key={i} className={log.startsWith('[ERROR]') ? 'text-red-500' : log.startsWith('[SUCCESS]') ? 'text-emerald-500' : log.startsWith('>') ? 'text-zinc-300 font-bold' : 'text-zinc-500'}>
                        {log}
                    </p>
                ))}
                <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleTerminalCommand} className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex items-center gap-3">
                <ChevronRight size={16} className="text-emerald-500" />
                <input 
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="inject command... (install [shard-id], list, clear)"
                    className="flex-1 bg-transparent border-none outline-none text-[12px] mono text-zinc-100 placeholder:text-zinc-800 uppercase"
                />
            </form>
        </div>
      </section>

      <div className="space-y-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Shield size={32} className="theme-accent-text" />
            Sovereign Pro Native Host
          </h2>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Standalone Windows Architecture with Integrated Identity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 space-y-8 flex flex-col justify-between group hover:border-emerald-500/30 transition-all shadow-2xl">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Bot size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black uppercase tracking-tight text-zinc-100">Pro Native Core</h4>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                  Fetches the Pro Native Core with all {files.length} current knowledge shards pre-baked into the source code.
                </p>
              </div>
            </div>
            <button 
              onClick={downloadNativeCore}
              className="w-full py-5 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl"
            >
              <FileCode size={18} />
              FETCH INTEGRATED BRAIN (.PY)
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 space-y-8 flex flex-col justify-between group hover:border-amber-500/30 transition-all shadow-2xl">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Package size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black uppercase tracking-tight text-zinc-100">Windows Build Suite</h4>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                  Automated batch script to compile the Integrated Brain into a professional .exe application.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                const batchCode = `@echo off
setlocal
echo [INIT] Aaayafuj Build Suite Starting...
pip install PyQt6 pyinstaller pillow
python -c "import base64; data = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAADW0lEQVR4nO2aTW7UQBCFv+pJYmEByQG4AnICJC6A7IADIHFCDsAFIDmAiZIDIDkAF4DkBkhugORATIDshGSRkEisYIuXInF6Zid2OnY6Hre9X7I8tmemp6pffV3dY6Ukk0wyydLhAn9vYm8D94BLuF918V7A4wU830S793AfcAf3I9wb2NuI9p3At9rBvS62P63qX4P7A+4H3C/w/q99vXvM4L2Be6t2uD9099vG2C8F3He4n/W4L+W47w7uT93+G2PvmALuB9wP8nE/YvUf6f0fW7v7I8v5rXv/S8L3v+FjvtT36499X96mK3f84P2fB/43fMw9+76T6tOVO77v/e8A/m8++h58/5Xq85U7vvf+rwP/Lx99j66+U97jV7v7X0Iu9x4+9974mD+B1Y993/78z0A3fK+tP6Bv/5f3/7m1G38+8P+19f8n8P9yY/f9y3f99f/L5pY6968817/qf/+r/v8F/t/W7v/71m67f6Gf/v8P/L/d2Fv/8p6+3f67fvrfB/zfcOyte/r66f9X4P+jtfv/nrVbv9DP/3vWbtv9O//zX/6XzS917p88/2vI87+Eev7L7P9r3v/XmOf/Gef5/9beA/eAr8Ab4C3wLpD8BvgeuAt8CHwE3gf8vY73AX+v433A3+v4L8Df63gf8Pc6fI/f63gf8Pca+M/X8T7g7zXwn6/jfYDHBv4/vXvA9wL/f2P8v45fCv7+C/D3X4DHOv4v6/h7Hb67jv8G/L2O3+v4L8Df63gf8Pc63gf8vY73AX+vgf98He8D/l4D//k63gf8vQb+83W8D/h7Dfzn63gf8Pca+M/X8T7g7zXwn6/jfYDHBn6vA/m7D7wB3AfcAy4AyfP7L8Df6/hfBv7+8wD/l/E+4O818P93Y/y/jl8K7P6H6v8F/t/W7v8X1m7bv9DP/w37/yfw/3Zj7/uX7/rr/w983O8A/u8ee++evn76fwf+f1q7/28Ye8fW7v7Iev67vP+XUOd/B/X8l9rvv+v+v8Y8/884z/+v9j7A/4v9f39m67fb/8CHfAnw/Y8F3uM78H4P8IivAX4Z6J8BPhX48f8C78vH/v8B/N8/+u7t5XfD91+S/wGvF8/fK17BpwAAAABJRU5ErkJggg=='; open('icon.ico', 'wb').write(base64.b64decode(data))"
pyinstaller --onefile --windowed --icon=icon.ico aaayafuj_standalone.py
echo [SUCCESS] Forged in dist\\aaayafuj_standalone.exe
pause
endlocal`;
                const blob = new Blob([batchCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'aaayafuj_build_suite.bat';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full py-5 bg-zinc-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 border border-white/5 hover:bg-zinc-700 transition-all shadow-xl"
            >
              <TerminalIcon size={18} />
              FETCH BUILD SUITE (.BAT)
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-white/5">
        <button onClick={wipeMemory} className="px-10 py-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-3">
          <Trash2 size={16} /> Wipe Neural Buffers
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
