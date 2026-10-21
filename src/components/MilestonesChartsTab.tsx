import React, { useState, useMemo } from 'react';
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
  Info
} from 'lucide-react';
import { CoupleGoal, Milestone, ThemeMode, TaskItem, UserProfile, DailySynergyRecord } from '../types';
import { sounds } from '../utils/audio';
import { loadFromStorage } from '../utils/storage';

interface MilestonesChartsTabProps {
  goals: CoupleGoal[];
  milestones: Milestone[];
  myTasks?: TaskItem[];
  partnerTasks?: TaskItem[];
  userMe?: UserProfile;
  userPartner?: UserProfile;
  togetherSince: string;
  theme: ThemeMode;
  soundEnabled: boolean;
  onAddGoal: () => void;
  onAddMilestone: () => void;
  onUpdateGoalProgress: (goalId: string, delta: number) => void;
  onToggleGoalComplete: (goalId: string) => void;
  onViewMemoriesWithTag?: (tag: string) => void;
}

export const MilestonesChartsTab: React.FC<MilestonesChartsTabProps> = ({
  goals,
  milestones,
  myTasks = [],
  partnerTasks = [],
  userMe,
  userPartner,
  togetherSince,
  soundEnabled,
  onAddGoal,
  onAddMilestone,
  onUpdateGoalProgress,
  onToggleGoalComplete,
  onViewMemoriesWithTag,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default to Today (last item)
  const [activeView, setActiveView] = useState<'goals' | 'milestones'>('goals');

  // Days together calculation
  const startDate = new Date(togetherSince || new Date().toISOString().split('T')[0]);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - startDate.getTime());
  const daysTogether = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    if (activeCategory === 'all') return true;
    return g.category === activeCategory;
  });

  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const avgGoalProgress = goals.length > 0 
    ? Math.round(
        goals.reduce((acc, g) => acc + Math.min(100, (g.currentAmount / g.targetAmount) * 100), 0) / goals.length
      )
    : 0;

  // Real 7-day data ending with today (NO FAKE / MOCK NUMBERS)
  const realWeeklyData: DailySynergyRecord[] = useMemo(() => {
    const history = loadFromStorage<Record<string, any>>('duo_daily_history', {});
    const days: DailySynergyRecord[] = [];
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const todayObj = new Date();

    // 7 days ending with today: [today - 6, ..., today]
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayObj);
      d.setDate(todayObj.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = DAY_NAMES[d.getDay()];
      const isToday = i === 0;

      if (isToday) {
        // Compute REAL live numbers for today
        const meTotal = myTasks.length;
        const meDone = myTasks.filter((t) => t.completed).length;
        const mePct = meTotal > 0 ? Math.round((meDone / meTotal) * 100) : 0;

        const pTotal = partnerTasks.length;
        const pDone = partnerTasks.filter((t) => t.completed).length;
        const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;

        const activeDivisor = (meTotal > 0 ? 1 : 0) + (pTotal > 0 ? 1 : 0);
        const comb = activeDivisor > 0 ? Math.round((mePct + pPct) / activeDivisor) : 0;

        days.push({
          date: dateStr,
          dayLabel,
          me: mePct,
          partner: pPct,
          combined: comb,
          meTasksDone: meDone,
          meTasksTotal: meTotal,
          partnerTasksDone: pDone,
          partnerTasksTotal: pTotal,
          isToday: true,
          isActiveDay: meTotal > 0 || pTotal > 0,
        });
      } else {
        // Look up historical record in localStorage
        const record = history[dateStr];
        if (record) {
          days.push({
            date: dateStr,
            dayLabel,
            me: record.me || 0,
            partner: record.partner || 0,
            combined: record.combined || 0,
            meTasksDone: record.meTasksDone || 0,
            meTasksTotal: record.meTasksTotal || 0,
            partnerTasksDone: record.partnerTasksDone || 0,
            partnerTasksTotal: record.partnerTasksTotal || 0,
            isToday: false,
            isActiveDay: true,
          });
        } else {
          // No history for this past day (e.g. before logging in or before room created)
          days.push({
            date: dateStr,
            dayLabel,
            me: 0,
            partner: 0,
            combined: 0,
            meTasksDone: 0,
            meTasksTotal: 0,
            partnerTasksDone: 0,
            partnerTasksTotal: 0,
            isToday: false,
            isActiveDay: false,
          });
        }
      }
    }
    return days;
  }, [myTasks, partnerTasks]);

  const selectedDay = realWeeklyData[selectedDayIndex] || realWeeklyData[6];

  const handleQuickAdd = (goalId: string, unit: string) => {
    const increment = unit === '$' ? 100 : 1;
    onUpdateGoalProgress(goalId, increment);
    sounds.playPop(soundEnabled);
  };

  const handleToggleComplete = (goalId: string) => {
    onToggleGoalComplete(goalId);
    sounds.playSuccess(soundEnabled);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Switcher: Goals vs Milestones Timeline */}
      <div className="flex items-center justify-between p-1 theme-card-subtle rounded-2xl border theme-border">
        <button
          onClick={() => setActiveView('goals')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeView === 'goals'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'theme-text-muted hover:theme-text'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Couple Goals &amp; Charts</span>
        </button>
        <button
          onClick={() => setActiveView('milestones')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeView === 'milestones'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'theme-text-muted hover:theme-text'
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
                  Relationship Synergy
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
                  <span className="text-pink-300 font-medium">Day {daysTogether} together 💕</span>
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

          {/* Real Synergy Chart (Calculated from real daily task data, no fake data) */}
          <div className="rounded-3xl p-5 theme-card border theme-border shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold tracking-wider theme-text-muted uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>DAILY SYNERGY PROGRESS</span>
                </h4>
                <p className="text-[11px] theme-text-muted mt-0.5">
                  Live real-time task completions (Day {daysTogether})
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 theme-text">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> {userMe?.name || 'You'}
                </span>
                <span className="flex items-center gap-1 theme-text">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> {userPartner?.name || 'Partner'}
                </span>
              </div>
            </div>

            {/* Bar Chart Visualization - Real Heights */}
            <div className="h-44 pt-4 pb-2 flex items-end justify-between gap-2 px-1">
              {realWeeklyData.map((item, index) => {
                const isSelected = selectedDayIndex === index;
                // Minimum 2px bar height so user can see flat zero vs active bars
                const meBarHeight = item.me > 0 ? `${item.me}%` : '3px';
                const partnerBarHeight = item.partner > 0 ? `${item.partner}%` : '3px';

                return (
                  <button
                    key={item.date}
                    onClick={() => {
                      setSelectedDayIndex(index);
                      sounds.playPop(soundEnabled);
                    }}
                    className={`flex-1 flex flex-col items-center gap-1.5 group cursor-pointer transition-all ${
                      isSelected ? 'scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="relative w-full h-28 flex items-end justify-center gap-1">
                      {/* You Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: meBarHeight }}
                        transition={{ duration: 0.4, delay: index * 0.04 }}
                        className={`w-2.5 rounded-t-md transition-all ${
                          item.me > 0
                            ? isSelected
                              ? 'bg-purple-500 shadow-md shadow-purple-500/50'
                              : 'bg-purple-600/70 group-hover:bg-purple-500'
                            : 'bg-slate-500/20'
                        }`}
                      />
                      {/* Partner Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: partnerBarHeight }}
                        transition={{ duration: 0.4, delay: index * 0.04 + 0.08 }}
                        className={`w-2.5 rounded-t-md transition-all ${
                          item.partner > 0
                            ? isSelected
                              ? 'bg-pink-500 shadow-md shadow-pink-500/50'
                              : 'bg-pink-600/70 group-hover:bg-pink-500'
                            : 'bg-slate-500/20'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[11px] font-semibold transition-colors ${
                          isSelected ? 'theme-text font-bold' : 'theme-text-muted'
                        }`}
                      >
                        {item.dayLabel}
                      </span>
                      {item.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Detail Card - Real Live Data Display */}
            <div className="mt-2 p-3 rounded-2xl theme-card-subtle border theme-border text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold theme-text flex items-center gap-1.5">
                  <span>{selectedDay.isToday ? 'Today (Live)' : selectedDay.dayLabel}</span>
                  <span className="text-[10px] font-normal theme-text-muted">({selectedDay.date})</span>
                  {selectedDay.isToday && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                      Day {daysTogether}
                    </span>
                  )}
                </span>
                <span className="theme-text-muted">
                  Combined: <strong className="text-purple-400 font-mono text-sm">{selectedDay.combined}%</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t theme-border text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="theme-text truncate">
                    {userMe?.name || 'You'}:{' '}
                    <strong>
                      {selectedDay.meTasksDone}/{selectedDay.meTasksTotal} done ({selectedDay.me}%)
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                  <span className="theme-text truncate">
                    {userPartner?.name || 'Partner'}:{' '}
                    <strong>
                      {selectedDay.partnerTasksDone}/{selectedDay.partnerTasksTotal} done ({selectedDay.partner}%)
                    </strong>
                  </span>
                </div>
              </div>

              {!selectedDay.isActiveDay && !selectedDay.isToday && (
                <div className="mt-1.5 text-[10px] theme-text-muted flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  <span>No tasks were recorded on this day prior to starting your space.</span>
                </div>
              )}
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
                    : 'theme-card-subtle theme-text-muted hover:theme-text border theme-border'
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
                  className={`rounded-3xl p-4 transition-all border theme-card theme-border ${
                    goal.completed ? 'opacity-85' : 'hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(goal.id)}
                        className={`mt-0.5 p-1 rounded-full border transition-all cursor-pointer ${
                          goal.completed
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'theme-border hover:border-purple-400 text-transparent'
                        }`}
                        title={goal.completed ? 'Mark incomplete' : 'Mark completed!'}
                      >
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      </button>

                      <div>
                        <h4
                          className={`text-sm font-bold theme-text flex items-center gap-1.5 ${
                            goal.completed ? 'line-through theme-text-muted' : ''
                          }`}
                        >
                          <span>{goal.title}</span>
                        </h4>
                        <p className="text-xs theme-text-muted mt-0.5 line-clamp-1">{goal.notes}</p>
                      </div>
                    </div>

                    {!goal.completed && (
                      <button
                        onClick={() => handleQuickAdd(goal.id, goal.unit)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-600/20 hover:bg-purple-600/35 text-purple-400 border border-purple-500/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                        title={`Add +${goal.unit === '$' ? '$100' : '1'} progress`}
                      >
                        +{goal.unit === '$' ? '$100' : '1'}
                      </button>
                    )}
                  </div>

                  {/* Progress Bar & Amount */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="theme-text-muted">
                        {goal.unit === '$' ? `$${goal.currentAmount.toLocaleString()}` : `${goal.currentAmount} ${goal.unit}`}{' '}
                        <span className="font-normal opacity-70">of</span>{' '}
                        {goal.unit === '$' ? `$${goal.targetAmount.toLocaleString()}` : `${goal.targetAmount} ${goal.unit}`}
                      </span>
                      <span className={pct >= 100 ? 'text-emerald-500 font-bold' : 'text-purple-500 font-bold'}>
                        {pct}%
                      </span>
                    </div>

                    <div className="h-2 w-full theme-card-subtle rounded-full overflow-hidden p-0.5 border theme-border">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Deadline & Category pill */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t theme-border text-[11px] theme-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Target: {goal.deadline}
                    </span>
                    <span className="capitalize text-purple-400 font-medium">
                      Assigned: {goal.assignedTo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {goals.length === 0 && (
            <div className="text-center py-8 px-4 rounded-3xl theme-card border theme-border theme-text-muted space-y-2">
              <Target className="w-8 h-8 mx-auto text-purple-400/60" />
              <h4 className="text-sm font-bold theme-text">No Couple Goals Yet</h4>
              <p className="text-xs theme-text-muted max-w-xs mx-auto">
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
              <h3 className="text-sm font-bold theme-text flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Our Relationship Milestones</span>
              </h3>
              <p className="text-xs theme-text-muted">Memorable days we have cherished and will celebrate</p>
            </div>

            <button
              onClick={onAddMilestone}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 text-xs font-semibold border border-pink-500/30 cursor-pointer active:scale-95"
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
                  <div
                    className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      m.completed || isPast
                        ? 'bg-pink-500 border-pink-300 shadow-md shadow-pink-500/50'
                        : 'theme-card border-purple-400'
                    }`}
                  >
                    <span className="text-[10px]">{m.icon}</span>
                  </div>

                  <div className="rounded-2xl p-4 theme-card border theme-border hover:border-pink-500/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold theme-text">{m.title}</h4>
                      <span className="text-[11px] font-semibold text-pink-500 whitespace-nowrap px-2 py-0.5 rounded-lg theme-card-subtle border theme-border">
                        {m.date}
                      </span>
                    </div>

                    <p className="text-xs theme-text-muted mt-1">{m.description}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t theme-border text-[11px]">
                      <span className={isPast ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>
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
            <div className="text-center py-8 px-4 rounded-3xl theme-card border theme-border theme-text-muted space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-pink-400/60" />
              <h4 className="text-sm font-bold theme-text">No Milestones Recorded Yet</h4>
              <p className="text-xs theme-text-muted max-w-xs mx-auto">
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
