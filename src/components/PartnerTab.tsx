import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Zap, Heart, PartyPopper, Check, Sparkles, Send } from 'lucide-react';
import { TaskItem, UserProfile } from '../types';
import { triggerCelebration } from '../utils/confetti';
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
  accentColor,
  onSendReaction,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingCheer, setIsSendingCheer] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const leftCount = tasks.filter((t) => !t.completed).length;
  const goalPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSendCheer = () => {
    setIsSendingCheer(true);
    triggerCelebration('confetti');
    sounds.playHeartCheer(soundEnabled);
    showToast(`You cheered on ${partner.name}! 🎉`);
    onSendReaction('cheer', `Sent cheering energy to ${partner.name}!`);
    setTimeout(() => setIsSendingCheer(false), 500);
  };

  const handleSendNudge = () => {
    sounds.playPop(soundEnabled);
    showToast(`Gentle nudge sent to ${partner.name} ⚡`);
    onSendReaction('nudge', `Nudged ${partner.name} lovingly!`);
  };

  const handleSendLove = () => {
    triggerCelebration('hearts');
    sounds.playHeartCheer(soundEnabled);
    showToast(`Love hearts sent to ${partner.name} 💕`);
    onSendReaction('love', `Sent a wave of love hearts to ${partner.name}`);
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

      {/* Partner Profile Card (Matches Screenshot 3) */}
      <div className="relative rounded-3xl p-5 bg-[#2b1816]/90 border border-[#482823] shadow-xl overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar with status dot */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#3f211c] border border-[#5d322b] flex items-center justify-center text-3xl shadow-inner">
                {partner.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#2b1816]" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {partner.name}
              </h2>
              <p className="text-xs text-rose-200/80 font-medium mt-0.5">
                {partner.statusText}
              </p>
            </div>
          </div>

          {/* Goal progress circle badge (100% in red ring) */}
          <div className="w-14 h-14 rounded-full border-4 border-rose-500/80 flex items-center justify-center bg-[#3a1d17] shadow-lg shadow-rose-900/40">
            <span className="text-xs font-black text-rose-100">{goalPercent}%</span>
          </div>
        </div>

        {/* Focus session card inside */}
        {partner.isDeepWork && (
          <div className="mt-4 p-3 rounded-2xl bg-[#3a201c] border border-[#522d26] flex items-center gap-2.5 text-xs text-amber-200">
            <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">Focus session in progress</span>
          </div>
        )}
      </div>

      {/* 3 Stat Boxes (Matches Screenshot 3: DONE, LEFT, GOAL) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 bg-[#151728] border border-[#262a4d] text-center shadow-md">
          <div className="text-2xl font-black text-cyan-400">{completedCount}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            DONE
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-[#151728] border border-[#262a4d] text-center shadow-md">
          <div className="text-2xl font-black text-rose-400">{leftCount}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            LEFT
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-[#151728] border border-[#262a4d] text-center shadow-md">
          <div className="text-2xl font-black text-purple-400">{goalPercent}%</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            GOAL
          </div>
        </div>
      </div>

      {/* Action Buttons: Send Cheer, Nudge, Send Love (Matches Screenshot 3) */}
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
          className="p-3 rounded-2xl bg-[#1b1e36] hover:bg-[#252a4d] text-amber-400 border border-[#2e345e] transition-all active:scale-95 cursor-pointer shadow-md"
          title="Send gentle nudge"
        >
          <Zap className="w-4 h-4 fill-amber-400" />
        </button>

        <button
          onClick={handleSendLove}
          className="p-3 rounded-2xl bg-[#1b1e36] hover:bg-[#252a4d] text-rose-400 border border-[#2e345e] transition-all active:scale-95 cursor-pointer shadow-md"
          title="Send heart love"
        >
          <Heart className="w-4 h-4 fill-rose-500" />
        </button>
      </div>

      {/* PARTNER'S TASKS (Matches Screenshot 3: DJIWDJ'S TASKS) */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          {partner.name.toUpperCase()}'S TASKS
        </span>

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#151728] border border-[#24284b]"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    task.completed
                      ? 'bg-teal-400 text-slate-950 shadow-sm shadow-teal-400/40'
                      : 'border-2 border-slate-600 bg-transparent'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <span
                  className={`text-sm font-semibold truncate ${
                    task.completed
                      ? 'line-through text-slate-400 font-normal'
                      : 'text-slate-100'
                  }`}
                >
                  {task.title}
                </span>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No tasks currently listed for {partner.name}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
