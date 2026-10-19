import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Plus, Check, MoreVertical, Trash2 } from 'lucide-react';
import { TaskItem, TreeState, UserProfile } from '../types';
import { CoupleTree } from './CoupleTree';
import { sounds } from '../utils/audio';
import { triggerCelebration } from '../utils/confetti';

interface UsTabProps {
  userMe: UserProfile;
  userPartner: UserProfile;
  sharedTasks: TaskItem[];
  myTasks: TaskItem[];
  partnerTasks: TaskItem[];
  tree: TreeState;
  onWaterTree: () => void;
  onToggleSharedTask: (taskId: string) => void;
  onAddSharedTask: (title: string) => void;
  onDeleteSharedTask: (taskId: string) => void;
  soundEnabled: boolean;
  accentColor: string;
}

export const UsTab: React.FC<UsTabProps> = ({
  userMe,
  userPartner,
  sharedTasks,
  myTasks,
  partnerTasks,
  tree,
  onWaterTree,
  onToggleSharedTask,
  onAddSharedTask,
  onDeleteSharedTask,
  soundEnabled,
  accentColor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Productivity math
  const myCompleted = myTasks.filter((t) => t.completed).length;
  const myTotal = myTasks.length;
  const myPercent = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;

  const partnerCompleted = partnerTasks.filter((t) => t.completed).length;
  const partnerTotal = partnerTasks.length;
  const partnerPercent = partnerTotal > 0 ? Math.round((partnerCompleted / partnerTotal) * 100) : 0;

  const togetherPercent = Math.round((myPercent + partnerPercent) / 2);

  const sharedCompletedCount = sharedTasks.filter((t) => t.completed).length;
  const sharedTotalCount = sharedTasks.length;

  const handleCreateSharedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddSharedTask(newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
    sounds.playPop(soundEnabled);
  };

  const handleToggle = (taskId: string, isChecked: boolean) => {
    onToggleSharedTask(taskId);
    if (!isChecked) {
      sounds.playSuccess(soundEnabled);
      triggerCelebration('confetti');
    } else {
      sounds.playPop(soundEnabled);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Couple Streak Card (Matches Screenshot 2 top card) */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-[#ff5e57] via-[#ff793f] to-[#ff9f43] text-white shadow-xl overflow-hidden">
        {/* Soft background radial flare */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100">
              <span>Couple Streak</span>
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-200" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-1">
              {Math.max(userMe.streakDays, userPartner.streakDays)}
            </div>
            <p className="text-xs font-semibold text-amber-100 mt-0.5">
              days in a row!
            </p>
          </div>

          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="text-4xl filter drop-shadow-md"
            >
              🔥
            </motion.div>
            <span className="text-[11px] font-bold text-amber-100 mt-1">
              Keep it up!
            </span>
          </div>
        </div>
      </div>

      {/* COMBINED PRODUCTIVITY Card (Matches Screenshot 2 middle card) */}
      <div className="rounded-3xl p-5 bg-[#151728]/95 border border-[#262a4d] shadow-lg backdrop-blur-sm space-y-4">
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          COMBINED PRODUCTIVITY
        </h3>

        {/* User 1 progress */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span>{userMe.avatar}</span>
              <span>{userMe.name}</span>
            </span>
            <span className="text-purple-400">{myPercent}%</span>
          </div>
          <div className="h-2 w-full bg-[#1c203b] rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${myPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Partner progress */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span>{userPartner.avatar}</span>
              <span>{userPartner.name}</span>
            </span>
            <span className="text-pink-400">{partnerPercent}%</span>
          </div>
          <div className="h-2 w-full bg-[#1c203b] rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${partnerPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Together Combined Progress */}
        <div className="pt-2 border-t border-[#222543]">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-white text-sm">Together</span>
            <span className="text-base font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {togetherPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#1c203b] rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${togetherPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* OUR TREE 🌱 Interactive Growth Component */}
      <CoupleTree
        tree={tree}
        onWaterTree={onWaterTree}
        accentColor={accentColor}
      />

      {/* SHARED LIST (Matches Screenshot 2 bottom list) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            SHARED LIST ({sharedCompletedCount}/{sharedTotalCount})
          </span>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1f233f] hover:bg-[#282d52] text-xs font-bold text-slate-200 border border-[#2e345e] transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Inline Add Task Form */}
        {isAdding && (
          <form onSubmit={handleCreateSharedTask} className="p-3 rounded-2xl bg-[#16182e] border border-pink-500/40 space-y-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Cook dinner together, Buy anniversary tickets..."
              className="w-full px-3 py-2 rounded-xl bg-[#1e2240] text-sm text-white placeholder-slate-400 border border-[#2e345e] focus:outline-none focus:border-pink-400"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Add to Shared List
              </button>
            </div>
          </form>
        )}

        {/* Shared Tasks List */}
        <div className="space-y-2.5">
          {sharedTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                task.completed
                  ? 'bg-[#151728]/70 border-[#222543] opacity-80'
                  : 'bg-[#151728] border-[#24284b] hover:border-pink-500/30'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(task.id, task.completed)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-teal-400 text-slate-950 border border-teal-300 shadow-sm shadow-teal-400/40'
                      : 'border-2 border-slate-600 hover:border-pink-400 bg-transparent'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

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

              {/* Three dots menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuId === task.id && (
                  <div className="absolute right-0 top-7 z-20 w-28 rounded-xl bg-[#1c203b] border border-[#2e345e] shadow-xl py-1">
                    <button
                      onClick={() => {
                        onDeleteSharedTask(task.id);
                        setActiveMenuId(null);
                        sounds.playPop(soundEnabled);
                      }}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {sharedTasks.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No shared tasks yet. Plan a trip, groceries, or date night above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
