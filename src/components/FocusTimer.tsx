import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, ChevronDown, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FocusTimerProps {
  onSessionComplete?: (minutes: number) => void;
  soundEnabled: boolean;
  accentColor: string;
}

const PRESET_DURATIONS = [
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  soundEnabled,
  accentColor,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = selectedMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            sounds.playBell(soundEnabled);
            onSessionComplete?.(selectedMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedMinutes, soundEnabled, onSessionComplete]);

  const toggleTimer = () => {
    if (isCompleted) {
      setTimeLeft(selectedMinutes * 60);
      setIsCompleted(false);
    }
    sounds.playPop(soundEnabled);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
    setIsCompleted(false);
    sounds.playPop(soundEnabled);
  };

  const selectDuration = (mins: number) => {
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setIsMenuOpen(false);
    sounds.playPop(soundEnabled);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular gauge geometry
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="relative rounded-3xl p-5 bg-[#151728]/95 border border-[#262a4d] shadow-lg backdrop-blur-sm">
      {/* Header with duration dropdown */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          FOCUS TIMER
        </span>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#1f233f] text-slate-300 border border-[#2e345e] hover:border-purple-500/50 transition-colors cursor-pointer"
          >
            <span>{selectedMinutes}m</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-30 w-28 rounded-xl bg-[#1b1e36] border border-[#2e345e] shadow-xl py-1 overflow-hidden">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => selectDuration(preset.minutes)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    selectedMinutes === preset.minutes
                      ? 'bg-purple-600/30 text-purple-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-700/40'
                  }`}
                >
                  {preset.minutes} minutes
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Circular Timer Display */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Subtle background glow when active */}
          {isRunning && (
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-25 animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
          )}

          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 144 144">
            {/* Background ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#212542"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Active progress ring */}
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
              transition={{ ease: 'linear', duration: 0.5 }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="flex flex-col items-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7 mb-0.5 animate-bounce" />
                <span className="text-sm font-bold">DONE!</span>
              </div>
            ) : (
              <>
                <span className="text-3xl font-extrabold tracking-tight font-mono text-white">
                  {timeFormatted}
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
                  {isRunning ? 'FOCUSING' : 'READY'}
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
                ? 'bg-[#292e52] hover:bg-[#343a68] text-amber-300 border border-amber-400/30'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25'
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
            className="p-2.5 rounded-2xl bg-[#1d2139] hover:bg-[#272c4d] text-slate-400 hover:text-slate-200 border border-[#2e345e] transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
