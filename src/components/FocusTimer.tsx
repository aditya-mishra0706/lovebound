import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, ChevronDown, CheckCircle2, Target, Coffee, Sliders, X, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FocusTimerProps {
  onSessionComplete?: (minutes: number) => void;
  onTimerStart?: () => void;
  onTimerPause?: () => void;
  onTimerReset?: () => void;
  onAccumulateFocus?: (seconds: number) => void;
  currentMode?: 'focus' | 'relax';
  onToggleMode?: (mode: 'focus' | 'relax') => void;
  cumulativeMinutesToday: number;
  soundEnabled: boolean;
  accentColor: string;
}

// User Requirement: ONLY 15m, 30m, and 60m in presets
const PRESET_DURATIONS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '60m', minutes: 60 },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  onTimerStart,
  onTimerPause,
  onTimerReset,
  onAccumulateFocus,
  currentMode = 'relax',
  onToggleMode,
  cumulativeMinutesToday,
  soundEnabled,
  accentColor,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customInputMinutes, setCustomInputMinutes] = useState<string>('25');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Exact real-world time references to prevent timer drift
  const targetEndTimeRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);

  const totalSeconds = selectedMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

  // Real-world clock synchronized timer loop
  useEffect(() => {
    if (isRunning) {
      if (currentMode !== 'focus') {
        onToggleMode?.('focus');
      }
      onTimerStart?.();

      // Establish target end time based on real clock
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }
      lastTickTimeRef.current = Date.now();

      // Frequent ticks (every 200ms) to ensure exact synchronization without drift
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();

        // 1. Calculate exact remaining seconds from atomic wall-clock
        const remainingMs = targetEndTimeRef.current! - now;
        const exactRemainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        // 2. Accumulate focus seconds accurately based on elapsed real time
        const elapsedSec = Math.floor((now - lastTickTimeRef.current) / 1000);
        if (elapsedSec > 0) {
          accumulatedSecondsRef.current += elapsedSec;
          lastTickTimeRef.current += elapsedSec * 1000;
          if (accumulatedSecondsRef.current >= 60) {
            onAccumulateFocus?.(accumulatedSecondsRef.current);
            accumulatedSecondsRef.current = 0;
          }
        }

        // 3. Completion check
        if (exactRemainingSeconds <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          targetEndTimeRef.current = null;
          setTimeLeft(0);
          setIsRunning(false);
          setIsCompleted(true);
          sounds.playBell(soundEnabled);
          onSessionComplete?.(selectedMinutes);
        } else {
          setTimeLeft(exactRemainingSeconds);
        }
      }, 200);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      targetEndTimeRef.current = null;
      if (accumulatedSecondsRef.current > 0) {
        onAccumulateFocus?.(accumulatedSecondsRef.current);
        accumulatedSecondsRef.current = 0;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (accumulatedSecondsRef.current > 0) {
        onAccumulateFocus?.(accumulatedSecondsRef.current);
        accumulatedSecondsRef.current = 0;
      }
    };
  }, [isRunning, selectedMinutes, soundEnabled, onSessionComplete, onTimerStart, onAccumulateFocus, currentMode, onToggleMode]);

  // Recalculate accurately when user changes tabs or app regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isRunning && targetEndTimeRef.current) {
        const now = Date.now();
        const remainingMs = targetEndTimeRef.current - now;
        const exactRemainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
        setTimeLeft(exactRemainingSeconds);

        if (exactRemainingSeconds <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          targetEndTimeRef.current = null;
          setTimeLeft(0);
          setIsRunning(false);
          setIsCompleted(true);
          sounds.playBell(soundEnabled);
          onSessionComplete?.(selectedMinutes);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, selectedMinutes, soundEnabled, onSessionComplete]);

  const toggleTimer = () => {
    sounds.playPop(soundEnabled);

    if (isCompleted) {
      const resetSecs = selectedMinutes * 60;
      setTimeLeft(resetSecs);
      setIsCompleted(false);
      targetEndTimeRef.current = Date.now() + resetSecs * 1000;
      setIsRunning(true);
      onToggleMode?.('focus');
      return;
    }

    if (!isRunning) {
      // Starting or Resuming
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      lastTickTimeRef.current = Date.now();
      setIsRunning(true);
      onToggleMode?.('focus');
    } else {
      // Pausing: recalculate remaining accurately and clear target
      if (targetEndTimeRef.current) {
        const now = Date.now();
        const remainingMs = Math.max(0, targetEndTimeRef.current - now);
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }
      targetEndTimeRef.current = null;
      setIsRunning(false);
      onTimerPause?.();
    }
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    targetEndTimeRef.current = null;
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
    setIsCompleted(false);
    sounds.playPop(soundEnabled);
    onTimerReset?.();
  };

  const selectDuration = (mins: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    targetEndTimeRef.current = null;
    setSelectedMinutes(mins);
    setIsCustom(false);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setIsMenuOpen(false);
    sounds.playPop(soundEnabled);
  };

  const handleApplyCustomTime = () => {
    const mins = Math.max(1, Math.min(360, parseInt(customInputMinutes, 10) || 25));
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    targetEndTimeRef.current = null;
    setSelectedMinutes(mins);
    setIsCustom(true);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setIsCustomModalOpen(false);
    setIsMenuOpen(false);
    sounds.playSuccess(soundEnabled);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="relative rounded-3xl p-5 theme-card border theme-border shadow-lg">
      {/* Header with Mode Toggle & Duration */}
      <div className="flex items-center justify-between mb-4">
        {/* Focus vs Relax Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl theme-card-subtle border theme-border">
          <button
            type="button"
            onClick={() => {
              onToggleMode?.('focus');
              sounds.playPop(soundEnabled);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentMode === 'focus'
                ? 'bg-purple-600 text-white shadow-md'
                : 'theme-text-muted hover:opacity-80'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleMode?.('relax');
              sounds.playPop(soundEnabled);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentMode === 'relax'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'theme-text-muted hover:opacity-80'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Relax Mode</span>
          </button>
        </div>

        {/* Duration selector with 15m, 30m, 60m and Custom option */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold theme-card-subtle theme-text border theme-border hover:opacity-80 transition-colors cursor-pointer"
          >
            <span>{selectedMinutes}m {isCustom && '(Custom)'}</span>
            <ChevronDown className="w-3.5 h-3.5 theme-text-muted" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-30 w-36 rounded-xl theme-card border theme-border shadow-2xl py-1 overflow-hidden">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider theme-text-muted border-b theme-border">
                Presets
              </div>
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => selectDuration(preset.minutes)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    !isCustom && selectedMinutes === preset.minutes
                      ? 'bg-purple-600/30 text-purple-400 font-bold'
                      : 'theme-text hover:opacity-70'
                  }`}
                >
                  <span>{preset.minutes} min</span>
                  {!isCustom && selectedMinutes === preset.minutes && (
                    <Check className="w-3 h-3 text-purple-400" />
                  )}
                </button>
              ))}

              <div className="border-t theme-border mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsCustomModalOpen(true);
                    setIsMenuOpen(false);
                    sounds.playPop(soundEnabled);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isCustom ? 'text-purple-400 font-bold' : 'theme-text hover:opacity-70'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-pink-500" />
                  <span>Custom time...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Circular Real-Time Accurate Timer Display */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {isRunning && (
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />
          )}

          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              className="text-slate-200/20"
              strokeWidth="7"
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#timerGradient)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transition={{ ease: 'linear', duration: 0.2 }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center real-time text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="flex flex-col items-center text-emerald-500">
                <CheckCircle2 className="w-7 h-7 mb-0.5 animate-bounce" />
                <span className="text-sm font-bold">DONE!</span>
              </div>
            ) : (
              <>
                <span className="text-3xl font-extrabold tracking-tight font-mono theme-text">
                  {timeFormatted}
                </span>
                <span className="text-[11px] font-semibold tracking-wider theme-text-muted uppercase mt-0.5">
                  {isRunning ? '🎯 IN FOCUS' : currentMode === 'focus' ? 'FOCUS READY' : '🍃 RELAXING'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 text-white shadow-amber-600/30'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isCompleted ? 'Restart' : 'Start Focus'}</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            title="Reset timer"
            className="p-2.5 rounded-2xl theme-card-subtle theme-text-muted hover:theme-text border theme-border transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Cumulative Daily Focus Progress Card (Resets at midnight) */}
        <div className="w-full mt-4 pt-3 border-t theme-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 theme-text-muted">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>Today's Total Focus:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-purple-500 font-mono">
              {cumulativeMinutesToday}m
            </span>
            <span className="text-[10px] theme-text-muted">
              (resets midnight)
            </span>
          </div>
        </div>
      </div>

      {/* Custom Time Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xs rounded-3xl theme-card border theme-border shadow-2xl p-5"
            >
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full theme-card-subtle theme-text-muted hover:opacity-80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold theme-text">Custom Duration</h3>
                  <p className="text-[11px] theme-text-muted">Set any minutes between 1 and 360</p>
                </div>
              </div>

              <div className="my-4">
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(customInputMinutes, 10) || 15;
                      setCustomInputMinutes(String(Math.max(1, cur - 5)));
                    }}
                    className="w-9 h-9 rounded-xl theme-card-subtle border theme-border text-sm font-bold theme-text flex items-center justify-center hover:opacity-80 active:scale-95 cursor-pointer"
                  >
                    -5
                  </button>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="360"
                      value={customInputMinutes}
                      onChange={(e) => setCustomInputMinutes(e.target.value)}
                      className="w-24 text-center py-2 px-3 rounded-2xl theme-input border theme-border text-lg font-mono font-bold theme-text focus:outline-none"
                      autoFocus
                    />
                    <span className="absolute right-3 text-xs theme-text-muted pointer-events-none">min</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(customInputMinutes, 10) || 15;
                      setCustomInputMinutes(String(Math.min(360, cur + 5)));
                    }}
                    className="w-9 h-9 rounded-xl theme-card-subtle border theme-border text-sm font-bold theme-text flex items-center justify-center hover:opacity-80 active:scale-95 cursor-pointer"
                  >
                    +5
                  </button>
                </div>

                {/* Quick chip suggestions */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {[5, 10, 20, 25, 45, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomInputMinutes(String(m))}
                      className="px-2 py-0.5 rounded-lg theme-card-subtle text-[10px] font-semibold theme-text border theme-border hover:opacity-80 cursor-pointer"
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs theme-text-muted hover:opacity-80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomTime}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-md cursor-pointer hover:opacity-90 active:scale-95"
                >
                  Set {customInputMinutes || '15'} Min
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
