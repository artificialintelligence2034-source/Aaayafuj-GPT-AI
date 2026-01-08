
export enum View {
  CHAT = 'CHAT',
  TRAINING = 'TRAINING',
  MEDIA = 'MEDIA',
  VIDEO = 'VIDEO',
  VOICE = 'VOICE',
  SYSTEM = 'SYSTEM',
  BUILDER = 'BUILDER',
  SETTINGS = 'SETTINGS'
}

export enum BuildLanguage {
  PYTHON = 'PYTHON',
  RUST = 'RUST',
  CPP = 'CPP',
  WEB_REACT = 'WEB_REACT',
  DESKTOP_PYSIDE = 'DESKTOP_PYSIDE',
  SQL = 'SQL'
}

export type BuilderTab = 'CODE' | 'PREVIEW';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface LocalFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'indexed' | 'learning' | 'ready';
  lastModified: number;
  content?: string;
  cycles: number; // Number of times learned/reinforced
  strength: number; // 0-100 percentage of "understanding"
}

export interface AIPackage {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'available' | 'downloading' | 'installed' | 'running';
  progress: number;
  type: 'core' | 'driver' | 'logic';
}

export interface ThemeConfig {
  bgColor: string;
  accentColor: string;
}
