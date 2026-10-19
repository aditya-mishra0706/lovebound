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
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Midnight',
    tagline: 'Deep galaxy indigo & electric neon',
    bgClass: 'bg-[#0b0c16]',
    cardBgClass: 'bg-[#151728]',
    cardSubtleClass: 'bg-[#1b1e36]',
    borderClass: 'border-[#262a4d]',
    accentGradient: 'from-violet-600 via-purple-600 to-pink-500',
    primaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    textPrimary: 'text-slate-100',
    textMuted: 'text-slate-400',
    previewDots: ['#1e1b4b', '#8b5cf6', '#06b6d4'],
  },
  lovey: {
    id: 'lovey',
    name: 'Lovey Dovey',
    tagline: 'Sweet romantic pinks & heart glows',
    badge: 'POPULAR FOR COUPLES',
    bgClass: 'bg-[#160c14]',
    cardBgClass: 'bg-[#241322]',
    cardSubtleClass: 'bg-[#311a2f]',
    borderClass: 'border-[#492345]',
    accentGradient: 'from-pink-500 via-rose-500 to-red-400',
    primaryColor: '#f43f5e',
    accentColor: '#fb7185',
    textPrimary: 'text-rose-50',
    textMuted: 'text-rose-200/60',
    previewDots: ['#fff1f2', '#f43f5e', '#fb7185'],
  },
  warm: {
    id: 'warm',
    name: 'Minimal Warm',
    tagline: 'Clean warm cream & gentle lavender',
    bgClass: 'bg-[#141210]',
    cardBgClass: 'bg-[#201c19]',
    cardSubtleClass: 'bg-[#2b2622]',
    borderClass: 'border-[#3f3833]',
    accentGradient: 'from-amber-500 via-orange-400 to-rose-400',
    primaryColor: '#f59e0b',
    accentColor: '#c084fc',
    textPrimary: 'text-amber-50',
    textMuted: 'text-stone-400',
    previewDots: ['#fef3c7', '#c084fc', '#f97316'],
  },
  oled: {
    id: 'oled',
    name: 'OLED Dark',
    tagline: 'Sleek dark mode with vibrant accents',
    bgClass: 'bg-[#000000]',
    cardBgClass: 'bg-[#101014]',
    cardSubtleClass: 'bg-[#181820]',
    borderClass: 'border-[#242430]',
    accentGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    primaryColor: '#6366f1',
    accentColor: '#ec4899',
    textPrimary: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    previewDots: ['#18181b', '#818cf8', '#f43f5e'],
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Dream',
    tagline: 'Dreamy pastel lilacs & soft periwinkle',
    bgClass: 'bg-[#100d1c]',
    cardBgClass: 'bg-[#1c1731]',
    cardSubtleClass: 'bg-[#262044]',
    borderClass: 'border-[#3a3264]',
    accentGradient: 'from-violet-500 via-purple-400 to-indigo-400',
    primaryColor: '#a78bfa',
    accentColor: '#c084fc',
    textPrimary: 'text-violet-50',
    textMuted: 'text-violet-300/60',
    previewDots: ['#ede9fe', '#a78bfa', '#f472b6'],
  },
};
