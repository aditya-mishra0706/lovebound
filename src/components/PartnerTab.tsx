import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Zap, Heart, PartyPopper, Check, Sparkles, Target } from 'lucide-react';
import { TaskItem, UserProfile } from '../types';
import { sounds } from '../utils/audio';

interface PartnerTabProps {
  partner: UserProfile;
  tasks: TaskItem[];
  soundEnabled: boolean;
  accentColor: string;
  onSendReaction: (type: 'cheer' | 'nudge' | 'love', message?: string) => void;
}

export const PartnerTab: React.FC<PartnerTabProps> = ({
  partner,
  tasks,
  soundEnabled,
  onSendReaction,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingCheer, setIsSendingCheer] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const leftCount = tasks.filter((t) => !t.completed).length;
  const goalPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const isPartnerInFocus = partner.statusMode === 'focus' || partner.isDeepWork;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSendCheer = () => {
    setIsSendingCheer(true);
    sounds.playHeartCheer(soundEnabled);
    showToast(`You cheered on ${partner.name}! 🎉`);
    onSendReaction('cheer', `Cheering you on! 🎉`);
    setTimeout(() => setIsSendingCheer(false), 500);
  };

  const handleSendNudge = () => {
    sounds.playPop(soundEnabled);
    showToast(`Gentle nudge sent to ${partner.name} ⚡`);
    onSendReaction('nudge', `Thinking of you! ⚡`);
  };

  const handleSendLove = () => {
    sounds.playHeartCheer(soundEnabled);
    showToast(`Love hearts sent to ${partner.name} 💕`);
    onSendReaction('love', `Sent you love 💕`);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partner Profile Card */}
      <div className="relative rounded-3xl p-5 theme-card border theme-border shadow-xl overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar with status indicator */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl theme-card-subtle border theme-border flex items-center justify-center text-3xl shadow-inner">
                {partner.avatar}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 theme-card ${
                  isPartnerInFocus
                    ? 'bg-purple-500 animate-pulse'
                    : 'bg-emerald-500'
                }`}
                title={isPartnerInFocus ? 'In Deep Focus' : 'Relaxing'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold theme-text tracking-tight">
                  {partner.name}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isPartnerInFocus
                      ? 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isPartnerInFocus ? '🎯 In Focus' : '🍃 Relaxing'}
                </span>
              </div>
              <p className="text-xs theme-text-muted font-medium mt-0.5">
                {partner.statusText || (isPartnerInFocus ? 'In deep focus mode' : 'Available & relaxed')}
              </p>
            </div>
          </div>

          {/* Goal progress circle badge */}
          <div className="w-14 h-14 rounded-full border-4 border-rose-500/80 flex items-center justify-center theme-card-subtle shadow-md">
            <span className="text-xs font-black theme-text">{goalPercent}%</span>
          </div>
        </div>

        {/* Live Focus or Relax Status Banner */}
        <div className="mt-4 p-3 rounded-2xl theme-card-subtle border theme-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            {isPartnerInFocus ? (
              <>
                <Target className="w-4 h-4 text-purple-400 shrink-0 animate-spin" />
                <div>
                  <span className="font-bold theme-text block">Focus Mode Active 🎯</span>
                  <span className="text-[11px] theme-text-muted">
                    {partner.name} is in deep concentration.
                  </span>
                </div>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold theme-text block">Relax Mode 🍃</span>
                  <span className="text-[11px] theme-text-muted">
                    {partner.name} is relaxing or taking a break.
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] theme-text-muted block font-semibold">Today's Focus</span>
            <span className="font-extrabold text-sm text-purple-500 font-mono">
              {partner.focusMinutesToday || 0}m
            </span>
          </div>
        </div>
      </div>

      {/* 3 Stat Boxes: DONE, LEFT, GOAL */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 theme-card border theme-border text-center shadow-md">
          <div className="text-2xl font-black text-cyan-500">{completedCount}</div>
          <div className="text-[10px] font-bold theme-text-muted uppercase tracking-wider mt-0.5">
            DONE
          </div>
        </div>

        <div className="rounded-2xl p-4 theme-card border theme-border text-center shadow-md">
          <div className="text-2xl font-black text-rose-500">{leftCount}</div>
          <div className="text-[10px] font-bold theme-text-muted uppercase tracking-wider mt-0.5">
            LEFT
          </div>
        </div>

        <div className="rounded-2xl p-4 theme-card border theme-border text-center shadow-md">
          <div className="text-2xl font-black text-purple-500">{goalPercent}%</div>
          <div className="text-[10px] font-bold theme-text-muted uppercase tracking-wider mt-0.5">
            GOAL
          </div>
        </div>
      </div>

      {/* Action Buttons: Send Cheer, Nudge, Send Love */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleSendCheer}
          disabled={isSendingCheer}
          className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <PartyPopper className="w-4 h-4" />
          <span>Send Cheer</span>
        </button>

        <button
          onClick={handleSendNudge}
          className="p-3 rounded-2xl theme-card-subtle text-amber-500 border theme-border transition-all active:scale-95 cursor-pointer shadow-md hover:opacity-80"
          title="Send gentle nudge"
        >
          <Zap className="w-4 h-4 fill-amber-500" />
        </button>

        <button
          onClick={handleSendLove}
          className="p-3 rounded-2xl theme-card-subtle text-rose-500 border theme-border transition-all active:scale-95 cursor-pointer shadow-md hover:opacity-80"
          title="Send heart love"
        >
          <Heart className="w-4 h-4 fill-rose-500" />
        </button>
      </div>

      {/* PARTNER'S TASKS */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold tracking-wider theme-text-muted uppercase">
          {partner.name.toUpperCase()}'S TASKS
        </span>

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3.5 rounded-2xl theme-card border theme-border"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    task.completed
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'border-2 theme-border bg-transparent'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <span
                  className={`text-sm font-semibold truncate ${
                    task.completed
                      ? 'line-through theme-text-muted font-normal'
                      : 'theme-text'
                  }`}
                >
                  {task.title}
                </span>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-6 text-xs theme-card-subtle rounded-2xl border theme-border theme-text-muted">
              No tasks currently listed for {partner.name}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
