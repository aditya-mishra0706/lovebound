import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, CheckCircle, Plus, Check, MoreVertical, Trash2, Target, Coffee } from 'lucide-react';
import { TaskItem, UserProfile, FocusModeStatus } from '../types';
import { FocusTimer } from './FocusTimer';
import { sounds } from '../utils/audio';

interface MeTabProps {
  user: UserProfile;
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onFocusComplete: (minutes: number) => void;
  onToggleStatusMode?: (mode: FocusModeStatus) => void;
  onAccumulateFocusTime?: (seconds: number) => void;
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
  onToggleStatusMode,
  onAccumulateFocusTime,
  soundEnabled,
  accentColor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const dailyPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentMode = user.statusMode || (user.isDeepWork ? 'focus' : 'relax');

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
      {/* Profile & Daily Goal Card */}
      <div className="relative rounded-3xl p-5 theme-card border theme-border shadow-xl overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold theme-text tracking-tight">
              {user.name}
            </h2>

            {/* Badges: Streak, Count, and Focus/Relax Status */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full theme-card-subtle border theme-border text-xs font-bold text-amber-500">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{user.streakDays || 1} day streak</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full theme-card-subtle border theme-border text-xs font-bold text-purple-500">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {completedCount}/{totalCount}
                </span>
              </div>

              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${
                  currentMode === 'focus'
                    ? 'bg-purple-950/40 text-purple-300 border-purple-600/40'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                }`}
              >
                {currentMode === 'focus' ? (
                  <>
                    <Target className="w-3 h-3 text-purple-400" />
                    <span>Focusing</span>
                  </>
                ) : (
                  <>
                    <Coffee className="w-3 h-3 text-emerald-400" />
                    <span>Relaxing</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Daily Circular Gauge */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={circleRadius}
                stroke="currentColor"
                className="text-slate-200/20"
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
              <span className="text-sm font-extrabold theme-text">{dailyPercent}%</span>
              <span className="text-[10px] theme-text-muted font-medium">daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Timer Card with Focus/Relax auto-toggle & cumulative tracking */}
      <FocusTimer
        onSessionComplete={onFocusComplete}
        currentMode={currentMode}
        onToggleMode={onToggleStatusMode}
        onAccumulateFocus={onAccumulateFocusTime}
        cumulativeMinutesToday={user.focusMinutesToday || 0}
        soundEnabled={soundEnabled}
        accentColor={accentColor}
      />

      {/* MY TASKS Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold tracking-wider theme-text-muted uppercase">
            MY TASKS
          </span>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl theme-card-subtle text-xs font-bold theme-text border theme-border hover:opacity-80 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Inline Add Task Form */}
        {isAdding && (
          <form onSubmit={handleCreateTask} className="p-3 rounded-2xl theme-card border theme-border space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Call partner during lunch, Plan date..."
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
              className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all border theme-card theme-border ${
                task.completed ? 'opacity-70' : 'hover:border-purple-500/40'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleTaskToggle(task.id, task.completed)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/40 ring-2 ring-purple-500/30'
                      : 'border-2 theme-border hover:border-purple-400'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

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

              {/* Three dots menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id)}
                  className="p-1 rounded-lg theme-text-muted hover:opacity-100 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuTaskId === task.id && (
                  <div className="absolute right-0 top-7 z-20 w-28 rounded-xl theme-card border theme-border shadow-xl py-1">
                    <button
                      onClick={() => {
                        onDeleteTask(task.id);
                        setActiveMenuTaskId(null);
                        sounds.playPop(soundEnabled);
                      }}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 cursor-pointer"
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
            <div className="text-center py-6 text-xs theme-card-subtle rounded-2xl border theme-border theme-text-muted">
              No tasks for today. Add one above to grow your tree & streak!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
