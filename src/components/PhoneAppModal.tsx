import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  Share2, 
  ShieldCheck, 
  Package,
  Terminal,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { sounds } from '../utils/audio';

interface PhoneAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const PhoneAppModal: React.FC<PhoneAppModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'project'>('install');
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'failed' | 'success'>('idle');
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setIsInIframe(window.self !== window.top);
      } catch (e) {
        setIsInIframe(true);
      }
    }
  }, []);

  if (!isOpen) return null;

  // Use the public shared URL or fallback to origin
  const currentUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('localhost') 
        ? 'https://ais-pre-n4s6d57els56ynyqq55mxu-251165663751.asia-northeast1.run.app' 
        : window.location.origin)
    : 'https://ais-pre-n4s6d57els56ynyqq55mxu-251165663751.asia-northeast1.run.app';

  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  const handleInstallClick = async () => {
    sounds.playPop(soundEnabled);
    setInstallStatus('installing');
    try {
      const success = await install();
      if (success) {
        setInstallStatus('success');
        sounds.playSuccess(soundEnabled);
      } else {
        setInstallStatus('failed');
      }
    } catch (e) {
      setInstallStatus('failed');
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      sounds.playPop(soundEnabled);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl theme-card border theme-border shadow-2xl p-5"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full theme-card-subtle theme-text-muted hover:opacity-80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Duo App Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full theme-bg rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold theme-text">Get Duo on Android &amp; Phones</h3>
            <p className="text-xs theme-text-muted">Direct phone install or standalone .apk package</p>
          </div>
        </div>

        {/* Navigation Tabs for Conversion Methods */}
        <div className="flex rounded-xl p-1 theme-card-subtle border theme-border mb-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('install');
              sounds.playPop(soundEnabled);
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'install'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'theme-text-muted hover:theme-text'
            }`}
          >
            Direct 1-Tap Install
          </button>
          <button
            onClick={() => {
              setActiveTab('apk');
              sounds.playPop(soundEnabled);
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'theme-text-muted hover:theme-text'
            }`}
          >
            Generate APK (.apk)
          </button>
          <button
            onClick={() => {
              setActiveTab('project');
              sounds.playPop(soundEnabled);
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'project'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'theme-text-muted hover:theme-text'
            }`}
          >
            Android Project (.zip)
          </button>
        </div>

        <div className="space-y-4">
          {/* TAB 1: DIRECT PHONE INSTALL */}
          {activeTab === 'install' && (
            <div className="space-y-3.5">
              {/* If running in an iframe warning */}
              {isInIframe && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Browser Preview Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Android Chrome blocks 1-tap installation inside preview frames. To install directly on your phone, open this link directly in mobile Chrome:
                  </p>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-[11px] shadow hover:bg-amber-400 transition cursor-pointer"
                  >
                    <span>Open Directly in Chrome</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Status Alert if install was tried and failed */}
              {installStatus === 'failed' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Why Chrome says "App can't be installed"</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    Chrome's cloud WebAPK minting service requires either opening outside preview frames or using Chrome's native 2-tap fallback. Use one of these 2 quick solutions:
                  </p>
                  <div className="p-2.5 rounded-xl theme-card border theme-border space-y-1.5 text-[11px] theme-text">
                    <p className="font-bold text-purple-300">Solution A (Chrome 2-Tap Fallback):</p>
                    <p className="theme-text-muted">
                      In Chrome, tap the top-right <strong>⋮ (three dots)</strong> &rarr; tap <strong>"Add to Home screen"</strong>. This bypasses the cloud check and creates the home app launcher icon immediately!
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl theme-card border theme-border space-y-1.5 text-[11px] theme-text">
                    <p className="font-bold text-pink-300">Solution B (Real .apk File):</p>
                    <p className="theme-text-muted">
                      Switch to the <strong>Generate APK</strong> tab above to get a signed, standalone <strong>.apk</strong> file that installs directly like any Android app.
                    </p>
                  </div>
                </div>
              )}

              {/* Main Card */}
              <div className="p-4 rounded-2xl theme-card-subtle border theme-border space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider theme-text">
                      1-Tap Phone Install
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    Home Screen
                  </span>
                </div>

                <p className="text-xs theme-text-muted leading-relaxed">
                  Installs Duo to your phone's home screen &amp; app launcher. Runs fullscreen in standalone mode without browser URL bars, exactly like an app store APK.
                </p>

                {isInstalled ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Duo is already installed on this device!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Duo to Home Screen</span>
                  </button>
                ) : isIOS ? (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs theme-text space-y-1.5">
                    <span className="font-bold flex items-center gap-1 text-purple-300">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>iOS Safari Install Steps:</span>
                    </span>
                    <ol className="list-decimal list-inside text-[11px] theme-text-muted space-y-1">
                      <li>Tap the <strong>Share</strong> button (box with upward arrow) at bottom of Safari.</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                      <li>Tap <strong>"Add"</strong> in top right corner.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl theme-card border theme-border text-xs theme-text space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-400 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Chrome Android Fallback:</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">100% Reliable</span>
                    </div>
                    <ol className="list-decimal list-inside text-[11px] theme-text-muted space-y-1.5">
                      <li>Open this app URL in your Android phone's <strong>Chrome</strong> browser.</li>
                      <li>Tap the <strong>⋮ (three dots menu)</strong> in the top-right corner.</li>
                      <li>Tap <strong>"Add to Home screen"</strong> (or <strong>"Install app"</strong>).</li>
                      <li>Tap <strong>"Add"</strong> to place the standalone Duo app icon on your screen!</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GENERATE APK VIA PWABUILDER */}
          {activeTab === 'apk' && (
            <div className="p-4 rounded-2xl theme-card-subtle border theme-border space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider theme-text flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-pink-400" />
                  <span>Instant Standalone APK (.apk)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                  Bypasses Browser Checks
                </span>
              </div>

              <p className="text-xs theme-text-muted leading-relaxed">
                PWABuilder compiles Duo into an official signed <strong>.apk</strong> file that you can download directly to your phone and install without browser minting restrictions:
              </p>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 text-xs">
                <span className="font-bold text-purple-200 block">How to get your .apk file:</span>
                <ol className="list-decimal list-inside text-[11px] theme-text-muted space-y-1.5">
                  <li>Tap the button below to load this app into PWABuilder.</li>
                  <li>Click <strong>"Package for Stores"</strong> &rarr; select <strong>"Android"</strong>.</li>
                  <li>Click <strong>"Generate"</strong> to download the ready-to-install <strong>.apk</strong> package!</li>
                </ol>
              </div>

              <a
                href={pwabuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Open PWABuilder &amp; Generate APK</span>
              </a>
            </div>
          )}

          {/* TAB 3: NATIVE ANDROID PROJECT (.ZIP) */}
          {activeTab === 'project' && (
            <div className="p-4 rounded-2xl theme-card-subtle border theme-border space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider theme-text flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Capacitor Android Project (.zip)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  Full Source
                </span>
              </div>

              <p className="text-xs theme-text-muted leading-relaxed">
                Download the complete native Android project directory ready for compilation into <strong>app-debug.apk</strong> via Android Studio or the command line.
              </p>

              <a
                href="/api/download-android-project"
                download="duo-android-project.zip"
                className="w-full py-3 px-4 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-purple-300" />
                <span>Download Android Project (duo-android-project.zip)</span>
              </a>

              <div className="p-3 rounded-xl theme-card border theme-border text-xs font-mono space-y-1 text-[11px]">
                <span className="text-pink-400 font-sans font-bold block">How to build app-debug.apk:</span>
                <p className="text-slate-400">1. Unzip <span className="text-purple-300">duo-android-project.zip</span></p>
                <p className="text-slate-400">2. Open folder in Android Studio OR terminal:</p>
                <code className="block p-1.5 rounded bg-black/40 text-emerald-400 select-all">
                  ./gradlew assembleDebug
                </code>
                <p className="text-slate-400 text-[10px] font-sans pt-0.5">
                  Output APK will be generated at: <br />
                  <span className="text-purple-300 font-mono">app/build/outputs/apk/debug/app-debug.apk</span>
                </p>
              </div>
            </div>
          )}

          {/* Share with Partner Link */}
          <div className="p-3.5 rounded-2xl theme-card border theme-border flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold theme-text block">Direct Mobile URL (for Chrome)</span>
              <span className="text-[11px] theme-text-muted truncate block font-mono">
                {currentUrl}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-pink-600/20 text-pink-400 hover:bg-pink-600/30 border border-pink-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t theme-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs theme-text-muted hover:opacity-80 cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
