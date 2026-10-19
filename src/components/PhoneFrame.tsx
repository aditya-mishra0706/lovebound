import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Sun, Moon, Smartphone, Maximize2, Minimize2, Users } from 'lucide-react';
import { ThemeConfig } from '../utils/theme';

interface PhoneFrameProps {
  children: React.ReactNode;
  themeConfig: ThemeConfig;
  onToggleTheme: () => void;
  activeUserName: string;
  activeUserAvatar: string;
  partnerName: string;
  pairingCode?: string;
  isPaired?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  themeConfig,
  onToggleTheme,
  activeUserName,
  activeUserAvatar,
  partnerName,
  pairingCode,
  isPaired,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('12:30');
  const [isPhoneView, setIsPhoneView] = useState<boolean>(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4">
      {/* Top Controls Bar for Desktop */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between mb-3 text-xs text-slate-400 px-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isPaired ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span>{activeUserAvatar} {activeUserName}</span>
          </span>
          {isPaired && (
            <span className="text-[11px] text-pink-300 font-medium">
              &amp; {partnerName} 💕
            </span>
          )}
          {pairingCode && (
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(pairingCode);
                  alert(`Copied sync code: ${pairingCode}`);
                }
              }}
              className="px-2 py-0.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 font-mono text-[11px] cursor-pointer"
              title="Click to copy pairing code"
            >
              Code: {pairingCode}
            </button>
          )}
        </div>

        <button
          onClick={() => setIsPhoneView(!isPhoneView)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181a2e] hover:bg-[#232746] text-slate-300 border border-[#2e345e] cursor-pointer"
        >
          {isPhoneView ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container / Phone Mockup */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isPhoneView
            ? 'max-w-[420px] sm:rounded-[44px] sm:border-[8px] sm:border-[#1a1c2e] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.15)] sm:ring-1 sm:ring-slate-700/50 min-h-[840px]'
            : 'max-w-2xl sm:rounded-3xl border border-[#232746]'
        } ${themeConfig.bgClass} overflow-hidden flex flex-col`}
      >
        {/* Dynamic Island / Speaker Pill (Only in phone view) */}
        {isPhoneView && (
          <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 pointer-events-none">
            <div className="absolute right-3 top-1 w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
          </div>
        )}

        {/* Mobile Status Bar (Matches Screenshot 1, 2, 3) */}
        <div className="sticky top-0 z-40 px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-slate-300 select-none bg-inherit/90 backdrop-blur-md">
          {/* Left: Clock */}
          <span className="font-bold tracking-tight text-white">{currentTime}</span>

          {/* Right: Mobile status indicators (signal, wifi, battery, theme button) */}
          <div className="flex items-center gap-3">
            {/* Signal bars */}
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-1.5 bg-slate-300 rounded-xs" />
              <span className="w-0.5 h-2 bg-slate-300 rounded-xs" />
              <span className="w-0.5 h-2.5 bg-slate-300 rounded-xs" />
              <span className="w-0.5 h-3 bg-slate-300 rounded-xs" />
            </div>

            {/* WiFi icon */}
            <Wifi className="w-3.5 h-3.5 text-slate-300 stroke-[2.5]" />

            {/* Battery icon */}
            <div className="flex items-center">
              <div className="w-5 h-2.5 rounded-xs border border-slate-300 p-0.5 flex items-center">
                <div className="w-3 h-1.5 bg-slate-300 rounded-2xs" />
              </div>
              <div className="w-0.5 h-1 bg-slate-300 rounded-r-xs -ml-px" />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Partner Connection Banner on mobile */}
        <div className="sm:hidden px-4 py-1.5 bg-[#141629] border-b border-[#232746] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPaired ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="truncate">
              <strong className="text-white">{activeUserAvatar} {activeUserName}</strong>
              {isPaired && <span className="text-pink-300 font-medium"> &amp; {partnerName} 💕</span>}
            </span>
          </div>
          {pairingCode && (
            <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40 shrink-0">
              {pairingCode}
            </span>
          )}
        </div>

        {/* Inner Content Area */}
        <main className="flex-1 px-4 pt-2 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};
