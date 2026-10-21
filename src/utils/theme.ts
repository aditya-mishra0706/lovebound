import { ThemeMode } from '../types';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  tagline: string;
  badge?: string;
  bgClass: string;
  cardBgClass: string;
  cardSubtleClass: string;
  borderClass: string;
  accentGradient: string;
  primaryColor: string;
  accentColor: string;
  textPrimary: string;
  textMuted: string;
  previewDots: string[];
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Pure Light',
    tagline: 'Clean bright whites & elegant daylight contrast',
    badge: 'DAYLIGHT',
    bgClass: 'bg-[#f8fafc] text-slate-900',
    cardBgClass: 'bg-white text-slate-900 shadow-md',
    cardSubtleClass: 'bg-slate-100',
    borderClass: 'border-slate-200',
    accentGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    primaryColor: '#6366f1',
    accentColor: '#ec4899',
    textPrimary: 'text-slate-900',
    textMuted: 'text-slate-500',
    previewDots: ['#ffffff', '#6366f1', '#ec4899'],
  },
  dark: {
    id: 'dark',
    name: 'Cosmic Dark',
    tagline: 'Deep obsidian space & electric neon glow',
    badge: 'DEFAULT',
    bgClass: 'bg-[#090a12] text-slate-100',
    cardBgClass: 'bg-[#131525] text-slate-100',
    cardSubtleClass: 'bg-[#1c1f36]',
    borderClass: 'border-[#262a4d]',
    accentGradient: 'from-violet-600 via-purple-600 to-pink-500',
    primaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    textPrimary: 'text-slate-100',
    textMuted: 'text-slate-400',
    previewDots: ['#090a12', '#8b5cf6', '#06b6d4'],
  },
  love: {
    id: 'love',
    name: 'Love Romance',
    tagline: 'Passionate strawberry blush & romantic rose',
    badge: 'FOR COUPLES 💕',
    bgClass: 'bg-[#fff1f2] text-rose-950',
    cardBgClass: 'bg-white text-rose-950 shadow-md shadow-rose-200/40',
    cardSubtleClass: 'bg-[#ffe4e6]',
    borderClass: 'border-[#fecdd3]',
    accentGradient: 'from-rose-500 via-pink-500 to-red-400',
    primaryColor: '#f43f5e',
    accentColor: '#fb7185',
    textPrimary: 'text-rose-950',
    textMuted: 'text-rose-700',
    previewDots: ['#fff1f2', '#f43f5e', '#fb7185'],
  },
  dream: {
    id: 'dream',
    name: 'Dream Lavender',
    tagline: 'Ethereal celestial twilight & cosmic aurora',
    badge: 'MAGIC ✨',
    bgClass: 'bg-[#0d0b22] text-violet-100',
    cardBgClass: 'bg-[#17133b] text-violet-100',
    cardSubtleClass: 'bg-[#231c54]',
    borderClass: 'border-[#382c76]',
    accentGradient: 'from-purple-500 via-violet-400 to-cyan-400',
    primaryColor: '#c084fc',
    accentColor: '#38bdf8',
    textPrimary: 'text-violet-100',
    textMuted: 'text-violet-300',
    previewDots: ['#0d0b22', '#c084fc', '#38bdf8'],
  },
};
