import React, { useState } from 'react';
import { Smartphone, Maximize2, Sparkles } from 'lucide-react';
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
  onOpenPhoneAppModal?: () => void;
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
  onOpenPhoneAppModal,
}) => {
  const [isPhoneView, setIsPhoneView] = useState<boolean>(true);

  return (
    <div
      data-theme={themeConfig.id}
      className={`min-h-screen theme-bg transition-colors duration-300 flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4 selection:bg-purple-500 selection:text-white`}
    >
      {/* Top Controls Bar for Desktop */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between mb-3 text-xs theme-text-muted px-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold theme-text">
            <span className={`w-2 h-2 rounded-full ${isPaired ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span>{activeUserAvatar} {activeUserName}</span>
          </span>
          {isPaired && (
            <span className="text-[11px] text-pink-500 font-medium">
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
              className="px-2 py-0.5 rounded-lg theme-card-subtle theme-border border text-[11px] font-mono cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to copy pairing code"
            >
              Code: {pairingCode}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenPhoneAppModal && (
            <button
              onClick={onOpenPhoneAppModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 text-purple-200 cursor-pointer hover:opacity-90 transition-opacity text-xs font-bold"
              title="Get Android APK or install on phone"
            >
              <Smartphone className="w-3.5 h-3.5 text-pink-400" />
              <span>Get APK / Phone App</span>
            </button>
          )}

          <button
            onClick={() => setIsPhoneView(!isPhoneView)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg theme-card theme-border border cursor-pointer hover:opacity-80 transition-opacity text-xs"
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
      </div>

      {/* Main Container / Phone Mockup (Top bar with wifi/battery removed as requested) */}
      <div
        data-theme={themeConfig.id}
        className={`w-full transition-all duration-300 relative theme-bg ${
          isPhoneView
            ? 'max-w-[420px] sm:rounded-[40px] sm:border-[6px] theme-border sm:shadow-2xl min-h-[840px]'
            : 'max-w-2xl sm:rounded-3xl border theme-border'
        } overflow-hidden flex flex-col`}
      >
        {/* Inner Content Area - Clean, no artificial status bar */}
        <main className="flex-1 px-4 pt-4 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};
