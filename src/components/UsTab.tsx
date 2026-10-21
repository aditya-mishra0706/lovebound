import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Plus, Check, MoreVertical, Trash2 } from 'lucide-react';
import { TaskItem, TreeState, UserProfile } from '../types';
import { CoupleTree } from './CoupleTree';
import { sounds } from '../utils/audio';

interface UsTabProps {
  userMe: UserProfile;
  userPartner: UserProfile;
  sharedTasks: TaskItem[];
  myTasks: TaskItem[];
  partnerTasks: TaskItem[];
  tree: TreeState;
  onWaterTree?: () => void;
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
  onToggleSharedTask,
  onAddSharedTask,
  onDeleteSharedTask,
  soundEnabled,
  accentColor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Productivity calculations
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
    } else {
      sounds.playPop(soundEnabled);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Couple Streak Card */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-[#ff5e57] via-[#ff793f] to-[#ff9f43] text-white shadow-xl overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100">
              <span>Couple Streak</span>
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-200" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-1">
              {Math.max(userMe.streakDays || 1, userPartner.streakDays || 1)}
            </div>
            <p className="text-xs font-semibold text-amber-100 mt-0.5">
              days active together!
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

      {/* COMBINED PRODUCTIVITY Card */}
      <div className="rounded-3xl p-5 theme-card border theme-border shadow-lg space-y-4">
        <h3 className="text-xs font-bold tracking-wider theme-text-muted uppercase">
          COMBINED PRODUCTIVITY
        </h3>

        {/* User 1 progress */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 theme-text">
              <span>{userMe.avatar}</span>
              <span>{userMe.name}</span>
            </span>
            <span className="text-purple-500 font-extrabold">{myPercent}%</span>
          </div>
          <div className="h-2 w-full theme-card-subtle rounded-full overflow-hidden p-0.5 border theme-border">
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
            <span className="flex items-center gap-1.5 theme-text">
              <span>{userPartner.avatar}</span>
              <span>{userPartner.name}</span>
            </span>
            <span className="text-pink-500 font-extrabold">{partnerPercent}%</span>
          </div>
          <div className="h-2 w-full theme-card-subtle rounded-full overflow-hidden p-0.5 border theme-border">
            <motion.div
              className="h-full bg-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${partnerPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Together Combined Progress */}
        <div className="pt-2 border-t theme-border">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="theme-text text-sm font-extrabold">Together</span>
            <span className="text-base font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {togetherPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full theme-card-subtle rounded-full overflow-hidden p-0.5 border theme-border">
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
        accentColor={accentColor}
      />

      {/* SHARED LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold tracking-wider theme-text-muted uppercase">
            SHARED LIST ({sharedCompletedCount}/{sharedTotalCount})
          </span>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl theme-card-subtle hover:opacity-80 text-xs font-bold theme-text border theme-border transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shared</span>
          </button>
        </div>

        {/* Inline Add Shared Task Form */}
        {isAdding && (
          <form onSubmit={handleCreateSharedTask} className="p-3 rounded-2xl theme-card border theme-border space-y-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Cook dinner together, Book flights..."
              className="w-full px-3 py-2 rounded-xl theme-input text-sm theme-text placeholder:theme-text-muted border theme-border focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded-xl text-xs theme-text-muted hover:opacity-80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-90"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Task Items */}
        <div className="space-y-2.5">
          {sharedTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all border theme-card theme-border ${
                task.completed ? 'opacity-70' : 'hover:border-pink-500/50'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(task.id, task.completed)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 ring-2 ring-pink-500/30'
                      : 'border-2 theme-border hover:border-pink-500'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      task.completed
                        ? 'line-through theme-text-muted font-normal'
                        : 'theme-text'
                    }`}
                  >
                    {task.title}
                  </p>
                  <span className="text-[10px] theme-text-muted flex items-center gap-1">
                    <span>Shared for both</span>
                  </span>
                </div>
              </div>

              {/* Delete / Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                  className="p-1 rounded-lg theme-text-muted hover:opacity-100 transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuId === task.id && (
                  <div className="absolute right-0 top-7 z-30 w-32 rounded-xl theme-card border theme-border shadow-xl py-1 overflow-hidden">
                    <button
                      onClick={() => {
                        onDeleteSharedTask(task.id);
                        setActiveMenuId(null);
                        sounds.playPop(soundEnabled);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {sharedTasks.length === 0 && !isAdding && (
            <div className="text-center py-6 px-4 rounded-2xl theme-card-subtle border theme-border theme-text-muted text-xs">
              No shared couple tasks yet. Tap "+ Add Shared" to create one together!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
