import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Target, 
  Sparkles, 
  ChevronRight,
  Flame,
  Plane,
  Heart,
  Home,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { CoupleGoal, Milestone, ThemeMode } from '../types';
import { triggerCelebration } from '../utils/confetti';
import { sounds } from '../utils/audio';

interface MilestonesChartsTabProps {
  goals: CoupleGoal[];
  milestones: Milestone[];
  onAddGoal: () => void;
  onAddMilestone: () => void;
  onUpdateGoalProgress: (goalId: string, delta: number) => void;
  onToggleGoalComplete: (goalId: string) => void;
  togetherSince: string;
  theme: ThemeMode;
  soundEnabled: boolean;
  onViewMemoriesWithTag?: (tag: string) => void;
}

const WEEKLY_DATA = [
  { day: 'Mon', me: 80, partner: 100, combined: 90 },
  { day: 'Tue', me: 65, partner: 85, combined: 75 },
  { day: 'Wed', me: 100, partner: 100, combined: 100 },
  { day: 'Thu', me: 40, partner: 70, combined: 55 },
  { day: 'Fri', me: 90, partner: 90, combined: 90 },
  { day: 'Sat', me: 100, partner: 100, combined: 100 },
  { day: 'Sun', me: 33, partner: 100, combined: 67 },
];

export const MilestonesChartsTab: React.FC<MilestonesChartsTabProps> = ({
  goals,
  milestones,
  onAddGoal,
  onAddMilestone,
  onUpdateGoalProgress,
  onToggleGoalComplete,
  togetherSince,
  theme,
  soundEnabled,
  onViewMemoriesWithTag,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number>(6); // Default Sunday (today)
  const [activeView, setActiveView] = useState<'goals' | 'milestones'>('goals');

  // Days together calculation
  const startDate = new Date(togetherSince);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const daysTogether = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    if (activeCategory === 'all') return true;
    return g.category === activeCategory;
  });

  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const avgGoalProgress = Math.round(
    goals.reduce((acc, g) => acc + Math.min(100, (g.currentAmount / g.targetAmount) * 100), 0) /
      (goals.length || 1)
  );

  const handleQuickAdd = (goalId: string, unit: string) => {
    const increment = unit === '$' ? 100 : 1;
    onUpdateGoalProgress(goalId, increment);
    sounds.playPop(soundEnabled);
  };

  const handleToggleComplete = (goalId: string) => {
    onToggleGoalComplete(goalId);
    triggerCelebration('confetti');
    sounds.playSuccess(soundEnabled);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Switcher: Goals vs Milestones Timeline */}
      <div className="flex items-center justify-between p-1 bg-[#131526] rounded-2xl border border-[#232746]">
        <button
          onClick={() => setActiveView('goals')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeView === 'goals'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Couple Goals & Charts</span>
        </button>
        <button
          onClick={() => setActiveView('milestones')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeView === 'milestones'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Milestones Timeline</span>
        </button>
      </div>

      {activeView === 'goals' ? (
        <>
          {/* Couple High Level Synergy Banner */}
          <div className="rounded-3xl p-5 bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-pink-900/40 border border-purple-500/30 shadow-lg relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Relationship Velocity
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-0.5">
                  {avgGoalProgress}% <span className="text-xs font-normal text-purple-200">average goal progress</span>
                </h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    {completedGoalsCount} of {goals.length} achieved
                  </span>
                  <span>·</span>
                  <span className="text-pink-300 font-medium">{daysTogether} days together 💕</span>
                </div>
              </div>

              <button
                onClick={onAddGoal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Goal</span>
              </button>
            </div>
          </div>

          {/* Interactive Weekly Synergy Chart */}
          <div className="rounded-3xl p-5 bg-[#151728]/95 border border-[#262a4d] shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>WEEKLY SYNERGY COMPARISON</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tap any day to see task completions & focus time
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> ad
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> djiwdj
                </span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-44 pt-4 pb-2 flex items-end justify-between gap-2 px-1">
              {WEEKLY_DATA.map((item, index) => {
                const isSelected = selectedDay === index;
                return (
                  <button
                    key={item.day}
                    onClick={() => {
                      setSelectedDay(index);
                      sounds.playPop(soundEnabled);
                    }}
                    className={`flex-1 flex flex-col items-center gap-1.5 group cursor-pointer transition-all ${
                      isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Bars Container */}
                    <div className="relative w-full h-28 flex items-end justify-center gap-1">
                      {/* ad bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.me}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`w-2.5 rounded-t-md transition-all ${
                          isSelected ? 'bg-purple-400 shadow-md shadow-purple-500/50' : 'bg-purple-600/70 group-hover:bg-purple-500'
                        }`}
                      />
                      {/* partner bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.partner}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
                        className={`w-2.5 rounded-t-md transition-all ${
                          isSelected ? 'bg-pink-400 shadow-md shadow-pink-500/50' : 'bg-pink-600/70 group-hover:bg-pink-500'
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[11px] font-semibold transition-colors ${
                        isSelected ? 'text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      {item.day}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Detail Card */}
            <div className="mt-2 p-3 rounded-2xl bg-[#1d2038] border border-[#2b3055] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">
                  {WEEKLY_DATA[selectedDay].day} Breakdown:
                </span>
                <span className="text-slate-300 ml-2">
                  Combined synergy: <strong className="text-purple-300">{WEEKLY_DATA[selectedDay].combined}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-purple-300">🦋 {WEEKLY_DATA[selectedDay].me}%</span>
                <span>·</span>
                <span className="text-pink-300">👨‍🎨 {WEEKLY_DATA[selectedDay].partner}%</span>
              </div>
            </div>
          </div>

          {/* Goal Categories Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Goals' },
              { id: 'travel', label: '✈️ Travel' },
              { id: 'romance', label: '💖 Romance' },
              { id: 'home', label: '🏡 Home' },
              { id: 'wellness', label: '🧘 Wellness' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  sounds.playPop(soundEnabled);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#181a2e] text-slate-400 hover:text-slate-200 border border-[#262a4d]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Goals List */}
          <div className="space-y-3">
            {filteredGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div
                  key={goal.id}
                  className={`rounded-3xl p-4 transition-all border ${
                    goal.completed
                      ? 'bg-[#151728]/60 border-emerald-500/30 opacity-90'
                      : 'bg-[#151728] border-[#262a4d] hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(goal.id)}
                        className={`mt-0.5 p-1 rounded-full border transition-all cursor-pointer ${
                          goal.completed
                            ? 'bg-emerald-500 border-emerald-400 text-slate-900'
                            : 'border-slate-500 hover:border-purple-400 text-transparent'
                        }`}
                        title={goal.completed ? 'Mark incomplete' : 'Mark completed!'}
                      >
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      </button>

                      <div>
                        <h4
                          className={`text-sm font-bold text-white flex items-center gap-1.5 ${
                            goal.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          <span>{goal.title}</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{goal.notes}</p>
                      </div>
                    </div>

                    {/* Quick increment button */}
                    {!goal.completed && (
                      <button
                        onClick={() => handleQuickAdd(goal.id, goal.unit)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                        title={`Add +${goal.unit === '$' ? '$100' : '1'} progress`}
                      >
                        +{goal.unit === '$' ? '$100' : '1'}
                      </button>
                    )}
                  </div>

                  {/* Progress Bar & Amount */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-400">
                        {goal.unit === '$' ? `$${goal.currentAmount.toLocaleString()}` : `${goal.currentAmount} ${goal.unit}`}{' '}
                        <span className="font-normal text-slate-500">of</span>{' '}
                        {goal.unit === '$' ? `$${goal.targetAmount.toLocaleString()}` : `${goal.targetAmount} ${goal.unit}`}
                      </span>
                      <span className={pct >= 100 ? 'text-emerald-400 font-bold' : 'text-purple-400'}>
                        {pct}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-[#1b1e36] rounded-full overflow-hidden p-0.5 border border-[#2b3055]">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Deadline & Category pill */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#222543] text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Target: {goal.deadline}
                    </span>
                    <span className="capitalize text-purple-300 font-medium">
                      Assigned: {goal.assignedTo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {goals.length === 0 && (
            <div className="text-center py-8 px-4 rounded-3xl bg-[#151728] border border-[#262a4d] text-slate-400 space-y-2">
              <Target className="w-8 h-8 mx-auto text-purple-400/60" />
              <h4 className="text-sm font-bold text-white">No Couple Goals Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Track shared savings, trips, or relationship habits together in real time!
              </p>
              <button
                onClick={onAddGoal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Goal</span>
              </button>
            </div>
          )}
        </>
      ) : (
        /* Shared Milestones Timeline */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Our Relationship Milestones</span>
              </h3>
              <p className="text-xs text-slate-400">Memorable days we have cherished and will celebrate</p>
            </div>

            <button
              onClick={onAddMilestone}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-xs font-semibold border border-pink-500/30 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-pink-500 before:to-indigo-500">
            {milestones.map((m) => {
              const mDate = new Date(m.date);
              const isPast = mDate <= now;
              return (
                <div key={m.id} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      m.completed || isPast
                        ? 'bg-pink-500 border-pink-300 shadow-md shadow-pink-500/50'
                        : 'bg-[#17192f] border-purple-400'
                    }`}
                  >
                    <span className="text-[10px]">{m.icon}</span>
                  </div>

                  {/* Card */}
                  <div className="rounded-2xl p-4 bg-[#151728] border border-[#262a4d] hover:border-pink-500/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                      <span className="text-[11px] font-semibold text-pink-400 whitespace-nowrap px-2 py-0.5 rounded-lg bg-pink-950/40 border border-pink-800/40">
                        {m.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1">{m.description}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#222543] text-[11px]">
                      <span className={isPast ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                        {isPast ? '✓ Cherished Memory' : '⏳ Upcoming Milestone'}
                      </span>

                      {onViewMemoriesWithTag && (
                        <button
                          onClick={() => onViewMemoriesWithTag(m.id)}
                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span>Photos</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {milestones.length === 0 && (
            <div className="text-center py-8 px-4 rounded-3xl bg-[#151728] border border-[#262a4d] text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-pink-400/60" />
              <h4 className="text-sm font-bold text-white">No Milestones Recorded Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Mark your special anniversaries, first date, or upcoming trips together!
              </p>
              <button
                onClick={onAddMilestone}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Milestone</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
