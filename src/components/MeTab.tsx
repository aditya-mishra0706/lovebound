import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, CheckCircle, Plus, Check, MoreVertical, Trash2 } from 'lucide-react';
import { TaskItem, UserProfile } from '../types';
import { FocusTimer } from './FocusTimer';
import { sounds } from '../utils/audio';
import { triggerCelebration } from '../utils/confetti';

interface MeTabProps {
  user: UserProfile;
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onFocusComplete: (minutes: number) => void;
  soundEnabled: boolean;
  accentColor: string;
}

export const MeTab: React.FC<MeTabProps> = ({
  user,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onFocusComplete,
  soundEnabled,
  accentColor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const dailyPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
    setIsAdding(false);
    sounds.playPop(soundEnabled);
  };

  const handleTaskToggle = (taskId: string, isChecked: boolean) => {
    onToggleTask(taskId);
    if (!isChecked) {
      sounds.playSuccess(soundEnabled);
      triggerCelebration('confetti');
    } else {
      sounds.playPop(soundEnabled);
    }
  };

  // SVG circle calculations for daily progress
  const circleRadius = 32;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference - (dailyPercent / 100) * circumference;

  return (
    <div className="space-y-4 pb-24">
      {/* Profile & Daily Goal Card (Matches Screenshot 1) */}
      <div className="relative rounded-3xl p-5 bg-[#171a33]/90 border border-[#272b4f] shadow-xl overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">
              {getGreeting()} 👋
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              {user.name}
            </h2>

            {/* Badges as in screenshot 1: 12 day streak & 1/3 */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24284b] border border-[#353b6b] text-xs font-bold text-amber-300">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user.streakDays} day streak</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#24284b] border border-[#353b6b] text-xs font-bold text-purple-300">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Circular Gauge (Screenshot 1 top right) */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={circleRadius}
                stroke="#262b50"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={circleRadius}
                stroke="url(#dailyGradient)"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="transparent"
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="dailyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-extrabold text-white">{dailyPercent}%</span>
              <span className="text-[10px] text-slate-400 font-medium">daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Timer Card */}
      <FocusTimer
        onSessionComplete={onFocusComplete}
        soundEnabled={soundEnabled}
        accentColor={accentColor}
      />

      {/* MY TASKS Section (Matches Screenshot 1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            MY TASKS
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
          <form onSubmit={handleCreateTask} className="p-3 rounded-2xl bg-[#16182e] border border-purple-500/40 space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Call partner during lunch, Book flight..."
              className="w-full px-3 py-2 rounded-xl bg-[#1e2240] text-sm text-white placeholder-slate-400 border border-[#2e345e] focus:outline-none focus:border-purple-400"
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
                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                task.completed
                  ? 'bg-[#151728]/70 border-[#222543] opacity-80'
                  : 'bg-[#151728] border-[#24284b] hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Round Checkbox (as in screenshot 1) */}
                <button
                  onClick={() => handleTaskToggle(task.id, task.completed)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-teal-400 text-slate-950 border border-teal-300 shadow-sm shadow-teal-400/40'
                      : 'border-2 border-slate-600 hover:border-purple-400 bg-transparent'
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
                  onClick={() => setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuTaskId === task.id && (
                  <div className="absolute right-0 top-7 z-20 w-28 rounded-xl bg-[#1c203b] border border-[#2e345e] shadow-xl py-1">
                    <button
                      onClick={() => {
                        onDeleteTask(task.id);
                        setActiveMenuTaskId(null);
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

          {tasks.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No tasks for today. Add one above to build your streak!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
