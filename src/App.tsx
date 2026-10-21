/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  loadFromStorage, 
  saveToStorage, 
  STORAGE_KEYS, 
  INITIAL_AUTH_SESSION,
  INITIAL_USERS, 
  INITIAL_TASKS, 
  INITIAL_GOALS, 
  INITIAL_MILESTONES, 
  INITIAL_MEMORIES, 
  INITIAL_TREE, 
  INITIAL_SETTINGS,
  DEMO_USERS,
  DEMO_TASKS,
  DEMO_GOALS,
  DEMO_MILESTONES,
  DEMO_MEMORIES,
  getTreeSpeciesInfo,
  clearAllData 
} from './utils/storage';
import { 
  AuthSession,
  UserProfile, 
  TaskItem, 
  CoupleGoal, 
  Milestone, 
  PhotoMemory, 
  TreeState, 
  CoupleSettings, 
  ThemeMode,
  FocusModeStatus,
  CelebrationEffect
} from './types';
import { THEMES } from './utils/theme';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav, TabType } from './components/BottomNav';
import { LoginPage } from './components/LoginPage';
import { MeTab } from './components/MeTab';
import { UsTab } from './components/UsTab';
import { MilestonesChartsTab } from './components/MilestonesChartsTab';
import { MemoriesTab } from './components/MemoriesTab';
import { PartnerTab } from './components/PartnerTab';
import { SettingsTab } from './components/SettingsTab';
import { AddGoalModal } from './components/AddGoalModal';
import { AddMilestoneModal } from './components/AddMilestoneModal';
import { AddMemoryModal } from './components/AddMemoryModal';
import { sounds } from './utils/audio';
import { triggerCelebration, stopCelebration } from './utils/confetti';
import { syncService } from './utils/syncService';

export default function App() {
  // 1. Authentication & Pairing Session
  const [authSession, setAuthSession] = useState<AuthSession>(() =>
    loadFromStorage(STORAGE_KEYS.AUTH_SESSION, INITIAL_AUTH_SESSION)
  );

  // 2. Persistent States
  const [users, setUsers] = useState<Record<string, UserProfile>>(() =>
    loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS)
  );

  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS)
  );

  const [goals, setGoals] = useState<CoupleGoal[]>(() =>
    loadFromStorage(STORAGE_KEYS.GOALS, INITIAL_GOALS)
  );

  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    loadFromStorage(STORAGE_KEYS.MILESTONES, INITIAL_MILESTONES)
  );

  const [memories, setMemories] = useState<PhotoMemory[]>(() =>
    loadFromStorage(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES)
  );

  const [tree, setTree] = useState<TreeState>(() =>
    loadFromStorage(STORAGE_KEYS.TREE, INITIAL_TREE)
  );

  const [settings, setSettings] = useState<CoupleSettings>(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    // Sanitize theme to one of the 4 valid options
    if (!['light', 'dark', 'love', 'dream'].includes(loaded.theme)) {
      loaded.theme = 'dark';
    }
    return loaded;
  });

  // 3. Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('me');

  // 4. Modals State
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);

  // 5. Live incoming sync banner & celebration stop controller
  const [liveSyncToast, setLiveSyncToast] = useState<string | null>(null);
  const [isCelebrationPlaying, setIsCelebrationPlaying] = useState<boolean>(false);

  const safeTriggerCelebration = () => {
    const isFxEnabled = typeof settings.celebrationFx === 'boolean'
      ? settings.celebrationFx
      : (settings.celebrationFx as any) !== 'none' && (settings.celebrationFx as any) !== 'no';

    if (!isFxEnabled) {
      stopCelebration();
      return;
    }

    triggerCelebration(true);
    setIsCelebrationPlaying(true);
    setTimeout(() => setIsCelebrationPlaying(false), 2000);
  };

  const handleStopCelebration = () => {
    stopCelebration();
    setIsCelebrationPlaying(false);
  };

  // Derived user roles
  const userRole: 'creator' | 'partner' = authSession.userRole || 'creator';
  const myUserId = userRole;
  const partnerUserId: 'creator' | 'partner' = userRole === 'creator' ? 'partner' : 'creator';

  const userMe = users[myUserId] || INITIAL_USERS[myUserId];
  const userPartner = users[partnerUserId] || INITIAL_USERS[partnerUserId];

  const currentTheme = THEMES[settings.theme] || THEMES.dark;

  // Filter tasks cleanly by ownerId
  const myTasks = tasks.filter((t) => t.ownerId === myUserId);
  const partnerTasks = tasks.filter((t) => t.ownerId === partnerUserId);
  const sharedTasks = tasks.filter((t) => t.ownerId === 'shared');

  // Real-time server sync initialization for two different phones/devices
  useEffect(() => {
    if (!authSession.isLoggedIn || !authSession.myPairingCode) return;

    syncService.init(authSession.myPairingCode, userRole);

    syncService.setListeners(
      (serverState) => {
        // 1. Sync partner status
        if (userRole === 'creator' && serverState.partner && serverState.partner.name) {
          const pName = serverState.partner.name;
          setAuthSession((prev) => {
            if (!prev.isPaired || prev.partnerName !== pName) {
              setLiveSyncToast(`Paired with ${pName} on their phone! 💕`);
              sounds.playHeartCheer(settings.soundAndHaptics);
              safeTriggerCelebration();
              setTimeout(() => setLiveSyncToast(null), 3500);
              return { ...prev, isPaired: true, partnerName: pName };
            }
            return prev;
          });

          setUsers((prev) => ({
            ...prev,
            partner: {
              ...prev.partner,
              ...serverState.partner,
              id: 'partner',
            },
          }));
        } else if (userRole === 'partner' && serverState.creator && serverState.creator.name) {
          setUsers((prev) => ({
            ...prev,
            partner: {
              ...prev.partner,
              ...serverState.creator,
              id: 'creator',
            },
          }));
        }

        // 2. Sync partner's tasks & shared tasks
        if (serverState) {
          const serverPartnerTasks: TaskItem[] =
            userRole === 'creator'
              ? serverState.partner?.tasks || []
              : serverState.creator?.tasks || [];

          const serverSharedTasks: TaskItem[] = serverState.shared?.sharedTasks || [];

          setTasks((prev) => {
            const currentMyTasks = prev.filter((t) => t.ownerId === myUserId);
            return [...currentMyTasks, ...serverPartnerTasks, ...serverSharedTasks];
          });
        }

        // 3. Sync shared couple goals
        if (serverState.shared && Array.isArray(serverState.shared.goals)) {
          setGoals(serverState.shared.goals);
        }

        // 4. Sync shared milestones
        if (serverState.shared && Array.isArray(serverState.shared.milestones)) {
          setMilestones(serverState.shared.milestones);
        }

        // 5. Sync shared photo memories
        if (serverState.shared && Array.isArray(serverState.shared.memories)) {
          setMemories(serverState.shared.memories);
        }

        // 6. Sync shared couple tree
        if (serverState.shared?.tree && serverState.shared.tree.points !== undefined) {
          setTree((prev) => ({
            ...prev,
            ...serverState.shared.tree,
          }));
        }

        // 7. Sync shared couple settings & nicknames
        if (serverState.shared?.coupleName) {
          setSettings((prev) => ({
            ...prev,
            coupleName: serverState.shared.coupleName,
            togetherSince: serverState.shared.togetherSince || prev.togetherSince,
          }));
        }
      },
      (reactionType, senderName) => {
        if (reactionType === 'cheer') {
          sounds.playSuccess(settings.soundAndHaptics);
          setLiveSyncToast(`${senderName} cheered you on! 🎉`);
        } else if (reactionType === 'love') {
          sounds.playHeartCheer(settings.soundAndHaptics);
          setLiveSyncToast(`${senderName} sent you hearts! 💖`);
        } else if (reactionType === 'nudge') {
          sounds.playPop(settings.soundAndHaptics);
          setLiveSyncToast(`${senderName} nudged you! ⚡`);
        }
        setTimeout(() => setLiveSyncToast(null), 3500);
      }
    );

    return () => {
      syncService.stop();
    };
  }, [authSession.isLoggedIn, authSession.myPairingCode, userRole, myUserId, settings.soundAndHaptics]);

  // Sync to local storage on updates
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AUTH_SESSION, authSession);
  }, [authSession]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOALS, goals);
  }, [goals]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MILESTONES, milestones);
  }, [milestones]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MEMORIES, memories);
  }, [memories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TREE, tree);
  }, [tree]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Midnight Rollover, Streak Check & Daily Reset
  useEffect(() => {
    const handleMidnightCheck = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = localStorage.getItem('duo_last_active_date');

      if (!lastActiveDate) {
        localStorage.setItem('duo_last_active_date', today);
        return;
      }

      if (lastActiveDate !== today) {
        // Midnight has passed!
        const myActiveTasks = tasks.filter((t) => t.ownerId === myUserId);
        const partnerActiveTasks = tasks.filter((t) => t.ownerId === partnerUserId);

        const myAllDone = myActiveTasks.length > 0 && myActiveTasks.every((t) => t.completed);
        const partnerAllDone = partnerActiveTasks.length > 0 && partnerActiveTasks.every((t) => t.completed);

        const bothCompleted = myAllDone && partnerAllDone;

        if (bothCompleted) {
          // Increment streak for both partners
          setUsers((prev) => ({
            ...prev,
            creator: {
              ...prev.creator,
              streakDays: (prev.creator.streakDays || 1) + 1,
              focusMinutesToday: 0,
            },
            partner: {
              ...prev.partner,
              streakDays: (prev.partner.streakDays || 1) + 1,
              focusMinutesToday: 0,
            },
          }));
          addTreePoints(30);
          setLiveSyncToast(`🔥 Midnight Streak Progressed! You both completed all tasks yesterday!`);
        } else {
          // Either partner missed a task -> Tree withers and resets to lower level by 2 lvls
          setTree((prev) => {
            const newLvl = Math.max(1, prev.level - 2);
            const speciesInfo = getTreeSpeciesInfo(newLvl);
            const witheredTree: TreeState = {
              ...prev,
              level: newLvl,
              points: 0,
              maxPoints: newLvl * 40 + 60,
              stageName: speciesInfo.stageName,
              species: speciesInfo.species,
              tier: speciesInfo.tier,
              isWithered: true,
              witherReason: 'A daily task was missed yesterday. Complete today\'s tasks together to revive it!',
            };
            syncService.pushUpdate({ userRole, shared: { tree: witheredTree } });
            return witheredTree;
          });

          // Reset streak to 1
          setUsers((prev) => ({
            ...prev,
            creator: {
              ...prev.creator,
              streakDays: 1,
              focusMinutesToday: 0,
            },
            partner: {
              ...prev.partner,
              streakDays: 1,
              focusMinutesToday: 0,
            },
          }));
          setLiveSyncToast(`🍂 Midnight Notice: Tree dropped 2 levels due to missed tasks. Complete today's tasks together to revive it!`);
        }

        // Reset tasks' completion state for the new day
        setTasks((prev) => {
          const resetList = prev.map((t) => ({ ...t, completed: false }));
          syncService.pushUpdate({
            userRole,
            userState: { tasks: resetList.filter((t) => t.ownerId === myUserId) },
            shared: { sharedTasks: resetList.filter((t) => t.ownerId === 'shared') },
          });
          return resetList;
        });

        localStorage.setItem('duo_last_active_date', today);
        setTimeout(() => setLiveSyncToast(null), 5000);
      }
    };

    handleMidnightCheck();
    const interval = setInterval(handleMidnightCheck, 30000);
    return () => clearInterval(interval);
  }, [tasks, myUserId, partnerUserId, userRole]);

  // Points awarded to Love Tree when tasks are completed
  const addTreePoints = (pointsToAdd: number) => {
    setTree((prev) => {
      const newPts = Math.max(0, prev.points + pointsToAdd);
      const maxPts = prev.maxPoints || (prev.level * 40 + 60);

      if (newPts >= maxPts) {
        const newLevel = prev.level + 1;
        const speciesInfo = getTreeSpeciesInfo(newLevel);

        // RARE CELEBRATION FX on tree level-up!
        safeTriggerCelebration();
        sounds.playSuccess(settings.soundAndHaptics);
        setLiveSyncToast(`🌳 Tree reached Level ${newLevel}! Evolved into ${speciesInfo.species}!`);
        setTimeout(() => setLiveSyncToast(null), 4000);

        const nextTree: TreeState = {
          ...prev,
          level: newLevel,
          points: newPts - maxPts,
          maxPoints: newLevel * 40 + 60,
          stageName: speciesInfo.stageName,
          species: speciesInfo.species,
          tier: speciesInfo.tier,
          isWithered: false,
        };
        syncService.pushUpdate({ userRole, shared: { tree: nextTree } });
        return nextTree;
      }

      const nextTree: TreeState = {
        ...prev,
        points: newPts,
        isWithered: false, // Completing tasks revives the tree!
      };
      syncService.pushUpdate({ userRole, shared: { tree: nextTree } });
      return nextTree;
    });
  };

  // Task actions
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => {
      let nowChecked = false;
      const nextTasks = prev.map((t) => {
        if (t.id === taskId) {
          nowChecked = !t.completed;
          return { ...t, completed: nowChecked };
        }
        return t;
      });

      // Award points when completed, deduct if uncompleted
      if (nowChecked) {
        addTreePoints(15);
      } else {
        addTreePoints(-15);
      }

      // Check if ALL daily tasks are completed by both -> trigger rare celebration
      const allDone = nextTasks.length > 0 && nextTasks.every((t) => t.completed);
      if (allDone && nowChecked) {
        safeTriggerCelebration();
        sounds.playHeartCheer(settings.soundAndHaptics);
        setLiveSyncToast(`🎉 All couple tasks completed for today! Awesome synergy!`);
        setTimeout(() => setLiveSyncToast(null), 4000);
      }

      syncService.pushUpdate({
        userRole,
        userState: { tasks: nextTasks.filter((t) => t.ownerId === myUserId) },
        shared: { sharedTasks: nextTasks.filter((t) => t.ownerId === 'shared') },
      });
      return nextTasks;
    });
  };

  const handleAddTask = (title: string, targetOwnerId?: string) => {
    const ownerId = targetOwnerId || myUserId;
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      completed: false,
      ownerId,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const next = [newTask, ...prev];
      syncService.pushUpdate({
        userRole,
        userState: { tasks: next.filter((t) => t.ownerId === myUserId) },
        shared: { sharedTasks: next.filter((t) => t.ownerId === 'shared') },
      });
      return next;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      syncService.pushUpdate({
        userRole,
        userState: { tasks: next.filter((t) => t.ownerId === myUserId) },
        shared: { sharedTasks: next.filter((t) => t.ownerId === 'shared') },
      });
      return next;
    });
  };

  // Focus and Relax mode toggle
  const handleToggleStatusMode = (mode: FocusModeStatus) => {
    setUsers((prev) => {
      const updatedUser: UserProfile = {
        ...prev[myUserId],
        statusMode: mode,
        isDeepWork: mode === 'focus',
        statusText: mode === 'focus' ? '🎯 In Deep Focus' : '🍃 Relaxing',
      };
      const updated = { ...prev, [myUserId]: updatedUser };
      syncService.pushUpdate({ userRole, userState: updatedUser });
      return updated;
    });
  };

  // Cumulative focus time accumulation (resets at midnight)
  const handleAccumulateFocusTime = (seconds: number) => {
    setUsers((prev) => {
      const currentSecs = (prev[myUserId].focusSecondsToday || 0) + seconds;
      const addedMinutes = Math.floor(currentSecs / 60);
      const remainingSecs = currentSecs % 60;

      if (addedMinutes > 0) {
        const updatedUser: UserProfile = {
          ...prev[myUserId],
          focusMinutesToday: (prev[myUserId].focusMinutesToday || 0) + addedMinutes,
          focusSecondsToday: remainingSecs,
        };
        syncService.pushUpdate({ userRole, userState: updatedUser });
        return { ...prev, [myUserId]: updatedUser };
      } else {
        return {
          ...prev,
          [myUserId]: {
            ...prev[myUserId],
            focusSecondsToday: currentSecs,
          },
        };
      }
    });
  };

  // Focus completion handler
  const handleFocusComplete = (minutes: number) => {
    addTreePoints(20);
    setUsers((prev) => {
      const updatedUser: UserProfile = {
        ...prev[myUserId],
        focusMinutesToday: (prev[myUserId].focusMinutesToday || 0) + minutes,
        statusMode: 'relax',
        isDeepWork: false,
        statusText: '🍃 Relaxing after focus session',
      };
      const updated = { ...prev, [myUserId]: updatedUser };
      syncService.pushUpdate({ userRole, userState: updatedUser });
      return updated;
    });
  };

  // Goal actions
  const handleAddGoal = (goalData: Omit<CoupleGoal, 'id' | 'completed'>) => {
    const newGoal: CoupleGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      completed: false,
    };
    setGoals((prev) => {
      const next = [newGoal, ...prev];
      syncService.pushUpdate({ userRole, shared: { goals: next } });
      return next;
    });
    sounds.playSuccess(settings.soundAndHaptics);
  };

  const handleUpdateGoalProgress = (goalId: string, delta: number) => {
    setGoals((prev) => {
      const next = prev.map((g) => {
        if (g.id === goalId) {
          const nextAmt = Math.min(g.targetAmount, Math.max(0, g.currentAmount + delta));
          const isNowCompleted = nextAmt >= g.targetAmount;
          if (isNowCompleted && !g.completed) {
            safeTriggerCelebration();
            addTreePoints(30);
          }
          return {
            ...g,
            currentAmount: nextAmt,
            completed: isNowCompleted ? true : g.completed,
          };
        }
        return g;
      });
      syncService.pushUpdate({ userRole, shared: { goals: next } });
      return next;
    });
  };

  const handleToggleGoalComplete = (goalId: string) => {
    setGoals((prev) => {
      const next = prev.map((g) => {
        if (g.id === goalId) {
          const nextCompleted = !g.completed;
          if (nextCompleted) {
            addTreePoints(30);
            safeTriggerCelebration();
          }
          return {
            ...g,
            completed: nextCompleted,
            currentAmount: nextCompleted ? g.targetAmount : g.currentAmount,
          };
        }
        return g;
      });
      syncService.pushUpdate({ userRole, shared: { goals: next } });
      return next;
    });
  };

  // Milestone actions
  const handleAddMilestone = (m: Omit<Milestone, 'id' | 'completed'>) => {
    const newMilestone: Milestone = {
      ...m,
      id: `m-${Date.now()}`,
      completed: new Date(m.date) <= new Date(),
    };
    setMilestones((prev) => {
      const next = [newMilestone, ...prev];
      syncService.pushUpdate({ userRole, shared: { milestones: next } });
      return next;
    });
    sounds.playSuccess(settings.soundAndHaptics);
  };

  // Memory actions
  const handleAddMemory = (mem: Omit<PhotoMemory, 'id' | 'likesCount' | 'cherishedBy'>) => {
    const newMem: PhotoMemory = {
      ...mem,
      id: `mem-${Date.now()}`,
      likesCount: 1,
      cherishedBy: [myUserId],
    };
    setMemories((prev) => {
      const next = [newMem, ...prev];
      syncService.pushUpdate({ userRole, shared: { memories: next } });
      return next;
    });
    sounds.playHeartCheer(settings.soundAndHaptics);
  };

  const handleLikeMemory = (memoryId: string) => {
    setMemories((prev) => {
      const next = prev.map((m) => {
        if (m.id === memoryId) {
          const hasLiked = m.cherishedBy.includes(myUserId);
          const nextCherished = hasLiked
            ? m.cherishedBy.filter((uid) => uid !== myUserId)
            : [...m.cherishedBy, myUserId];
          return {
            ...m,
            likesCount: hasLiked ? m.likesCount - 1 : m.likesCount + 1,
            cherishedBy: nextCherished,
          };
        }
        return m;
      });
      syncService.pushUpdate({ userRole, shared: { memories: next } });
      return next;
    });
  };

  const handleDeleteMemory = (memoryId: string) => {
    setMemories((prev) => {
      const next = prev.filter((m) => m.id !== memoryId);
      syncService.pushUpdate({ userRole, shared: { memories: next } });
      return next;
    });
  };

  // Partner interactions
  const handleSendPartnerReaction = (type: 'cheer' | 'nudge' | 'love') => {
    if (type === 'cheer') {
      sounds.playSuccess(settings.soundAndHaptics);
    } else if (type === 'nudge') {
      sounds.playPop(settings.soundAndHaptics);
    } else if (type === 'love') {
      sounds.playHeartCheer(settings.soundAndHaptics);
    }

    syncService.pushUpdate({
      userRole,
      reaction: { type, senderName: userMe.name },
    });
  };

  // Logout action
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out? Your couple data will remain securely saved on this server.')) {
      setAuthSession(INITIAL_AUTH_SESSION);
      sounds.playPop(settings.soundAndHaptics);
    }
  };

  // Reset Data action
  const handleResetData = () => {
    clearAllData();
    setUsers(INITIAL_USERS);
    setTasks(INITIAL_TASKS);
    setGoals(INITIAL_GOALS);
    setMilestones(INITIAL_MILESTONES);
    setMemories(INITIAL_MEMORIES);
    setTree(INITIAL_TREE);
    setSettings(INITIAL_SETTINGS);
    setAuthSession(INITIAL_AUTH_SESSION);
  };

  // Export / Backup
  const handleExportData = () => {
    const backup = {
      authSession,
      users,
      tasks,
      goals,
      milestones,
      memories,
      tree,
      settings,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `duo_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sounds.playSuccess(settings.soundAndHaptics);
  };

  // Import / Restore
  const handleImportData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.milestones) setMilestones(parsed.milestones);
      if (parsed.memories) setMemories(parsed.memories);
      if (parsed.tree) setTree(parsed.tree);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.authSession) setAuthSession(parsed.authSession);
      sounds.playSuccess(settings.soundAndHaptics);
      alert('Backup restored successfully!');
    } catch {
      alert('Invalid backup file. Please select a valid Duo JSON backup.');
    }
  };

  // Theme cycler for 4 options: light, dark, love, dream
  const handleToggleTheme = () => {
    const themeKeys: ThemeMode[] = ['light', 'dark', 'love', 'dream'];
    const currentIndex = themeKeys.indexOf(settings.theme);
    const nextTheme = themeKeys[(currentIndex + 1) % themeKeys.length];
    setSettings((prev) => ({ ...prev, theme: nextTheme }));
    sounds.playPop(settings.soundAndHaptics);
  };

  // IF NOT LOGGED IN: SHOW NEW USER LOGIN & PAIRING CODE SCREEN
  if (!authSession.isLoggedIn) {
    return (
      <LoginPage
        initialCode={authSession.myPairingCode}
        onLoginComplete={({
          user,
          partner,
          coupleName,
          togetherSince,
          pairingCode,
          userRole: newUserRole,
          isPaired,
          sharedTasks: serverSharedTasks,
          goals: serverGoals,
          milestones: serverMilestones,
          memories: serverMemories,
          tree: serverTree,
        }) => {
          const role = newUserRole || 'creator';
          const partnerRole = role === 'creator' ? 'partner' : 'creator';

          setUsers({
            [role]: {
              id: role,
              name: user.name || 'You',
              avatar: user.avatar || '🦋',
              email: user.email || '',
              age: '',
              gender: '',
              streakDays: user.streakDays || 1,
              statusText: user.statusText || 'Connected & ready',
              statusMode: 'relax',
              isDeepWork: false,
              focusMinutesToday: 0,
            },
            [partnerRole]: {
              id: partnerRole,
              name: partner.name || 'Partner',
              avatar: partner.avatar || '🌸',
              email: partner.email || '',
              age: '',
              gender: '',
              streakDays: partner.streakDays || 1,
              statusText: partner.statusText || (isPaired ? 'Paired & online' : 'Waiting for partner'),
              statusMode: 'relax',
              isDeepWork: false,
              focusMinutesToday: 0,
            },
          });

          setSettings((prev) => ({
            ...prev,
            coupleName: coupleName || prev.coupleName,
            togetherSince: togetherSince || prev.togetherSince,
          }));

          setTasks(serverSharedTasks || []);
          setGoals(serverGoals || []);
          setMilestones(serverMilestones || []);
          setMemories(serverMemories || []);
          if (serverTree && serverTree.points !== undefined) {
            setTree(serverTree);
          }

          setAuthSession({
            isLoggedIn: true,
            myPairingCode: pairingCode,
            userRole: role,
            isPaired: isPaired,
            partnerName: partner.name || 'Partner',
            connectedAt: new Date().toISOString(),
          });

          safeTriggerCelebration();
          sounds.playSuccess(true);
        }}
        onExploreDemo={() => {
          setUsers(DEMO_USERS);
          setTasks(DEMO_TASKS);
          setGoals(DEMO_GOALS);
          setMilestones(DEMO_MILESTONES);
          setMemories(DEMO_MEMORIES);
          setAuthSession({
            isLoggedIn: true,
            myPairingCode: 'DEMO-PREVIEW',
            userRole: 'creator',
            isPaired: true,
            partnerName: 'Maya',
            connectedAt: new Date().toISOString(),
          });
          safeTriggerCelebration();
          sounds.playSuccess(true);
        }}
      />
    );
  }

  return (
    <PhoneFrame
      themeConfig={currentTheme}
      onToggleTheme={handleToggleTheme}
      activeUserName={userMe.name}
      activeUserAvatar={userMe.avatar}
      partnerName={userPartner.name}
      pairingCode={authSession.myPairingCode}
      isPaired={authSession.isPaired}
    >
      {/* Live sync notification toast */}
      {liveSyncToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-2xl border border-white/20 animate-bounce">
          {liveSyncToast}
        </div>
      )}

      {/* Instant Stop Celebration Button when FX is playing */}
      {isCelebrationPlaying && (
        <div className="fixed top-4 right-4 z-50">
          <button
            type="button"
            onClick={handleStopCelebration}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-900 text-rose-300 text-[11px] font-bold border border-rose-500/40 shadow-2xl backdrop-blur-md cursor-pointer transition-all active:scale-95"
            title="Stop current celebration animation"
          >
            <span>Stop FX</span>
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500/30 text-rose-200 flex items-center justify-center text-[10px]">✕</span>
          </button>
        </div>
      )}

      {/* Tab 1: Me */}
      {activeTab === 'me' && (
        <MeTab
          user={userMe}
          tasks={myTasks}
          onToggleTask={handleToggleTask}
          onAddTask={(title) => handleAddTask(title, myUserId)}
          onDeleteTask={handleDeleteTask}
          onFocusComplete={handleFocusComplete}
          onToggleStatusMode={handleToggleStatusMode}
          onAccumulateFocusTime={handleAccumulateFocusTime}
          soundEnabled={settings.soundAndHaptics}
          accentColor={currentTheme.accentColor}
        />
      )}

      {/* Tab 2: Us */}
      {activeTab === 'us' && (
        <UsTab
          userMe={userMe}
          userPartner={userPartner}
          sharedTasks={sharedTasks}
          myTasks={myTasks}
          partnerTasks={partnerTasks}
          tree={tree}
          onToggleSharedTask={handleToggleTask}
          onAddSharedTask={(title) => handleAddTask(title, 'shared')}
          onDeleteSharedTask={handleDeleteTask}
          soundEnabled={settings.soundAndHaptics}
          accentColor={currentTheme.accentColor}
        />
      )}

      {/* Tab 3: Couple Goals, Charts & Milestones */}
      {activeTab === 'charts' && (
        <MilestonesChartsTab
          goals={goals}
          milestones={milestones}
          onAddGoal={() => setIsAddGoalOpen(true)}
          onAddMilestone={() => setIsAddMilestoneOpen(true)}
          onUpdateGoalProgress={handleUpdateGoalProgress}
          onToggleGoalComplete={handleToggleGoalComplete}
          togetherSince={settings.togetherSince}
          theme={settings.theme}
          soundEnabled={settings.soundAndHaptics}
          onViewMemoriesWithTag={() => setActiveTab('memories')}
        />
      )}

      {/* Tab 4: Private Photo Memories */}
      {activeTab === 'memories' && (
        <MemoriesTab
          memories={memories}
          onAddMemory={() => setIsAddMemoryOpen(true)}
          onLikeMemory={handleLikeMemory}
          onDeleteMemory={handleDeleteMemory}
          activeUserId={myUserId}
          soundEnabled={settings.soundAndHaptics}
        />
      )}

      {/* Tab 5: Partner */}
      {activeTab === 'partner' && (
        <PartnerTab
          partner={userPartner}
          tasks={partnerTasks}
          soundEnabled={settings.soundAndHaptics}
          accentColor={currentTheme.accentColor}
          onSendReaction={handleSendPartnerReaction}
        />
      )}

      {/* Tab 6: Settings */}
      {activeTab === 'settings' && (
        <SettingsTab
          settings={settings}
          user={userMe}
          partner={userPartner}
          pairingCode={authSession.myPairingCode}
          isPaired={authSession.isPaired}
          onUpdateSettings={(newVals) => {
            setSettings((prev) => {
              const updated = { ...prev, ...newVals };
              syncService.pushUpdate({ userRole, shared: { settings: updated } });
              return updated;
            });
          }}
          onUpdateUser={(newVals) => {
            setUsers((prev) => {
              const updatedUser = { ...prev[myUserId], ...newVals };
              const updated = { ...prev, [myUserId]: updatedUser };
              syncService.pushUpdate({ userRole, userState: updatedUser });
              return updated;
            });
          }}
          onResetData={handleResetData}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onLogout={handleLogout}
        />
      )}

      {/* Persistent Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          sounds.playPop(settings.soundAndHaptics);
        }}
        themeConfig={currentTheme}
        memoriesCount={memories.length}
      />

      {/* Modals */}
      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onSave={handleAddGoal}
      />

      <AddMilestoneModal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        onSave={handleAddMilestone}
      />

      <AddMemoryModal
        isOpen={isAddMemoryOpen}
        onClose={() => setIsAddMemoryOpen(false)}
        onSave={handleAddMemory}
      />
    </PhoneFrame>
  );
}
