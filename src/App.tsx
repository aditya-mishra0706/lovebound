/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  ThemeMode 
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
import { triggerCelebration } from './utils/confetti';
import { syncManager, SyncMessage } from './utils/syncChannel';
import { syncService } from './utils/syncService';

export default function App() {
  // 1. Authentication & Pairing Session (Persistent across app restarts)
  const [authSession, setAuthSession] = useState<AuthSession>(() =>
    loadFromStorage(STORAGE_KEYS.AUTH_SESSION, INITIAL_AUTH_SESSION)
  );

  // 2. Persistent States (NO dummy fallback for real accounts)
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

  const [settings, setSettings] = useState<CoupleSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );

  // 3. Active View Tab
  const [activeTab, setActiveTab] = useState<TabType>('me');

  // 4. Modals State
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);

  // 5. Live incoming sync banner
  const [liveSyncToast, setLiveSyncToast] = useState<string | null>(null);

  // Derived user roles: 'creator' vs 'partner'
  const userRole: 'creator' | 'partner' = authSession.userRole || 'creator';
  const myUserId = userRole;
  const partnerUserId: 'creator' | 'partner' = userRole === 'creator' ? 'partner' : 'creator';

  const userMe = users[myUserId] || INITIAL_USERS[myUserId];
  const userPartner = users[partnerUserId] || INITIAL_USERS[partnerUserId];

  const currentTheme = THEMES[settings.theme] || THEMES.cosmic;

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
              triggerCelebration('hearts');
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

        // 2. Sync partner's tasks & shared tasks without duplicate accumulation
        if (serverState) {
          const serverPartnerTasks: TaskItem[] =
            userRole === 'creator'
              ? serverState.partner?.tasks || []
              : serverState.creator?.tasks || [];

          const serverSharedTasks: TaskItem[] = serverState.shared?.sharedTasks || [];

          setTasks((prev) => {
            const currentMyTasks = prev.filter((t) => t.ownerId === myUserId);
            // Recombine with updated partner & shared tasks
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
          triggerCelebration(settings.celebrationFx);
          sounds.playSuccess(settings.soundAndHaptics);
          setLiveSyncToast(`${senderName} cheered you on from their phone! 🎉`);
        } else if (reactionType === 'love') {
          triggerCelebration('hearts');
          sounds.playHeartCheer(settings.soundAndHaptics);
          setLiveSyncToast(`${senderName} sent you hearts from their phone! 💖`);
        } else if (reactionType === 'nudge') {
          sounds.playPop(settings.soundAndHaptics);
          setLiveSyncToast(`${senderName} nudged you from their phone! ⚡`);
        }
        setTimeout(() => setLiveSyncToast(null), 3500);
      }
    );

    return () => {
      syncService.stop();
    };
  }, [authSession.isLoggedIn, authSession.myPairingCode, userRole, myUserId, settings.celebrationFx, settings.soundAndHaptics]);

  // Sync to local storage on updates (persists info even after closing the app)
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

  // Grow tree helper
  const addTreePoints = (pointsToAdd: number) => {
    setTree((prev) => {
      const newPts = prev.points + pointsToAdd;
      if (newPts >= prev.maxPoints) {
        const nextTree: TreeState = {
          ...prev,
          level: prev.level + 1,
          points: newPts - prev.maxPoints,
          stageName: `Level ${prev.level + 1} Cherry Blossom Tree 🌸`,
        };
        syncService.pushUpdate({ userRole, shared: { tree: nextTree } });
        return nextTree;
      }
      const nextTree: TreeState = {
        ...prev,
        points: newPts,
      };
      syncService.pushUpdate({ userRole, shared: { tree: nextTree } });
      return nextTree;
    });
  };

  // Tree watering action
  const handleWaterTree = () => {
    sounds.playPop(settings.soundAndHaptics);
    addTreePoints(10);
    setTree((prev) => {
      const updated = {
        ...prev,
        waterCountToday: prev.waterCountToday + 1,
      };
      syncService.pushUpdate({ userRole, shared: { tree: updated } });
      return updated;
    });
  };

  // Task actions
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => {
      const nextTasks = prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            addTreePoints(5);
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      });
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

  // Focus completion
  const handleFocusComplete = (minutes: number) => {
    addTreePoints(15);
    setUsers((prev) => {
      const updatedUser = {
        ...prev[myUserId],
        focusMinutesToday: prev[myUserId].focusMinutesToday + minutes,
      };
      const updated = {
        ...prev,
        [myUserId]: updatedUser,
      };
      syncService.pushUpdate({ userRole, userState: updatedUser });
      return updated;
    });
    triggerCelebration(settings.celebrationFx);
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
    triggerCelebration(settings.celebrationFx);
  };

  const handleUpdateGoalProgress = (goalId: string, delta: number) => {
    setGoals((prev) => {
      const next = prev.map((g) => {
        if (g.id === goalId) {
          const nextAmt = Math.min(g.targetAmount, Math.max(0, g.currentAmount + delta));
          const isNowCompleted = nextAmt >= g.targetAmount;
          if (isNowCompleted && !g.completed) {
            triggerCelebration(settings.celebrationFx);
            addTreePoints(25);
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
            addTreePoints(25);
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
    triggerCelebration(settings.celebrationFx);
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
    triggerCelebration('hearts');
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

  // Partner interactions with real cross-device server push
  const handleSendPartnerReaction = (type: 'cheer' | 'nudge' | 'love') => {
    if (type === 'cheer') {
      triggerCelebration(settings.celebrationFx);
    } else if (type === 'nudge') {
      sounds.playPop(settings.soundAndHaptics);
    } else if (type === 'love') {
      triggerCelebration('hearts');
    }

    // Push to server so partner on another phone receives the cheer/nudge/love!
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
      version: '1.2.0',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duo_couple_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.authSession) setAuthSession(data.authSession);
      if (data.users) setUsers(data.users);
      if (data.tasks) setTasks(data.tasks);
      if (data.goals) setGoals(data.goals);
      if (data.milestones) setMilestones(data.milestones);
      if (data.memories) setMemories(data.memories);
      if (data.tree) setTree(data.tree);
      if (data.settings) setSettings(data.settings);
      alert('Couple data restored successfully! 💖');
    } catch {
      alert('Invalid backup file. Please select a valid Duo JSON backup.');
    }
  };

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

  // Theme cycler for top sun/moon button
  const handleToggleTheme = () => {
    const themeKeys: ThemeMode[] = ['cosmic', 'lovey', 'warm', 'oled', 'lavender'];
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

          // Update user details cleanly
          setUsers({
            [role]: {
              id: role,
              name: user.name || 'You',
              avatar: user.avatar || '🦋',
              email: user.email || '',
              age: '',
              gender: '',
              streakDays: user.streakDays || 1,
              statusText: user.statusText || 'Connected & in love',
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
              isDeepWork: false,
              focusMinutesToday: 0,
            },
          });

          setSettings((prev) => ({
            ...prev,
            coupleName: coupleName || prev.coupleName,
            togetherSince: togetherSince || prev.togetherSince,
          }));

          // Hydrate with REAL server data (ZERO DUMMY DATA)
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

          triggerCelebration('confetti');
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
          triggerCelebration('confetti');
          sounds.playSuccess(true);
        }}
      />
    );
  }

  // IF LOGGED IN: RENDER COMPLETE APP
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

      {/* Tab 1: Me */}
      {activeTab === 'me' && (
        <MeTab
          user={userMe}
          tasks={myTasks}
          onToggleTask={handleToggleTask}
          onAddTask={(title) => handleAddTask(title, myUserId)}
          onDeleteTask={handleDeleteTask}
          onFocusComplete={handleFocusComplete}
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
          onWaterTree={handleWaterTree}
          onToggleSharedTask={handleToggleTask}
          onAddSharedTask={(title) => handleAddTask(title, 'shared')}
          onDeleteSharedTask={handleDeleteTask}
          soundEnabled={settings.soundAndHaptics}
          accentColor={currentTheme.accentColor}
        />
      )}

      {/* Tab 3: Couple Goals, Interactive Charts & Milestones */}
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
