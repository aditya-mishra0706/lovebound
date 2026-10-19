import { AuthSession, CoupleGoal, CoupleSettings, Milestone, PhotoMemory, TaskItem, TreeState, UserProfile } from '../types';

export const generatePairingCode = (): string => {
  const prefixes = ['DUO', 'LOVE', 'HEART', 'PAIR', 'MINT'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

const STORAGE_KEYS = {
  AUTH_SESSION: 'duo_auth_session',
  USERS: 'duo_users',
  TASKS: 'duo_tasks',
  GOALS: 'duo_goals',
  MILESTONES: 'duo_milestones',
  MEMORIES: 'duo_memories',
  TREE: 'duo_tree',
  SETTINGS: 'duo_settings',
};

export const INITIAL_AUTH_SESSION: AuthSession = {
  isLoggedIn: false,
  myPairingCode: '',
  userRole: 'creator',
  isPaired: false,
};

// Clean real initial profiles (NO DUMMY DATA)
export const INITIAL_USERS: Record<string, UserProfile> = {
  creator: {
    id: 'creator',
    name: 'You',
    avatar: '🦋',
    email: '',
    age: '',
    gender: '',
    streakDays: 1,
    statusText: 'Connected & in love',
    isDeepWork: false,
    focusMinutesToday: 0,
  },
  partner: {
    id: 'partner',
    name: 'Partner',
    avatar: '🌸',
    email: '',
    age: '',
    gender: '',
    streakDays: 1,
    statusText: 'Waiting for partner',
    isDeepWork: false,
    focusMinutesToday: 0,
  },
};

// Clean initial states for real couples (Empty, no dummy seed data)
export const INITIAL_TASKS: TaskItem[] = [];
export const INITIAL_GOALS: CoupleGoal[] = [];
export const INITIAL_MILESTONES: Milestone[] = [];
export const INITIAL_MEMORIES: PhotoMemory[] = [];

export const INITIAL_TREE: TreeState = {
  level: 1,
  points: 15,
  maxPoints: 100,
  stageName: 'Growing beautifully! 🌿',
  waterCountToday: 0,
};

export const INITIAL_SETTINGS: CoupleSettings = {
  coupleName: 'Sweethearts 🍯',
  togetherSince: new Date().toISOString().split('T')[0],
  theme: 'cosmic',
  celebrationFx: 'confetti',
  cheersAndNudges: true,
  partnerActivityAlerts: true,
  soundAndHaptics: true,
  language: 'English',
};

// Demo sample data (Used ONLY when user taps "Explore demo mode")
export const DEMO_USERS: Record<string, UserProfile> = {
  creator: {
    id: 'creator',
    name: 'Aditya',
    avatar: '🦋',
    email: 'aditya@example.com',
    age: '24 yrs',
    gender: 'Male',
    streakDays: 12,
    statusText: 'In flow',
    isDeepWork: false,
    focusMinutesToday: 45,
  },
  partner: {
    id: 'partner',
    name: 'Maya',
    avatar: '🌸',
    email: 'maya@example.com',
    age: '23 yrs',
    gender: 'Female',
    streakDays: 12,
    statusText: '🎧 In Deep Work',
    isDeepWork: true,
    focusMinutesToday: 60,
  },
};

export const DEMO_TASKS: TaskItem[] = [
  {
    id: 'demo-task-1',
    title: 'Review proposal presentation',
    completed: true,
    ownerId: 'creator',
    createdAt: '2026-10-18T09:00:00Z',
  },
  {
    id: 'demo-task-2',
    title: 'Morning stretch & matcha',
    completed: false,
    ownerId: 'creator',
    createdAt: '2026-10-18T09:30:00Z',
  },
  {
    id: 'demo-shared-1',
    title: 'Plan autumn getaway ✈️',
    completed: false,
    ownerId: 'shared',
    createdAt: '2026-10-18T11:00:00Z',
  },
  {
    id: 'demo-shared-2',
    title: 'Farmers market & cooking night 🥘',
    completed: true,
    ownerId: 'shared',
    createdAt: '2026-10-18T11:30:00Z',
  },
  {
    id: 'demo-partner-1',
    title: 'Finish design sprint',
    completed: true,
    ownerId: 'partner',
    createdAt: '2026-10-18T08:00:00Z',
  },
  {
    id: 'demo-partner-2',
    title: 'Pilates class',
    completed: false,
    ownerId: 'partner',
    createdAt: '2026-10-18T08:45:00Z',
  },
];

export const DEMO_GOALS: CoupleGoal[] = [
  {
    id: 'demo-goal-1',
    title: 'Tokyo Autumn Getaway ✈️',
    category: 'travel',
    targetAmount: 3500,
    currentAmount: 2450,
    unit: '$',
    deadline: '2026-11-20',
    notes: 'Saving for Shibuya food tour & onsen stay in Hakone.',
    completed: false,
    assignedTo: 'together',
    icon: '✈️',
  },
  {
    id: 'demo-goal-2',
    title: 'Cook 20 International Cuisines 🥘',
    category: 'romance',
    targetAmount: 20,
    currentAmount: 14,
    unit: 'dates',
    deadline: '2026-12-31',
    notes: 'Made handmade gnocchi, Thai curry, ramen, and paella so far!',
    completed: false,
    assignedTo: 'together',
    icon: '🍷',
  },
  {
    id: 'demo-goal-3',
    title: 'First Apartment Fund 🏡',
    category: 'home',
    targetAmount: 10000,
    currentAmount: 7200,
    unit: '$',
    deadline: '2027-03-31',
    notes: 'Saving for deposit and cozy walnut dining table.',
    completed: false,
    assignedTo: 'together',
    icon: '🗝️',
  },
];

export const DEMO_MILESTONES: Milestone[] = [
  {
    id: 'demo-m-1',
    title: 'First "Hello" & Coffee Date ☕',
    date: '2025-09-15',
    category: 'life',
    icon: '☕',
    completed: true,
    description: 'We talked for 4 hours until the cafe closed.',
  },
  {
    id: 'demo-m-2',
    title: 'Officially Sweethearts 🍯',
    date: '2025-10-30',
    category: 'anniversary',
    icon: '💖',
    completed: true,
    description: 'Under the autumn streetlights, we decided this was forever.',
  },
  {
    id: 'demo-m-3',
    title: '1-Year Anniversary Milestone 🥂',
    date: '2026-10-30',
    category: 'anniversary',
    icon: '✨',
    completed: false,
    description: '365 days of love, laughter, growth, and team spirit.',
  },
];

export const DEMO_MEMORIES: PhotoMemory[] = [
  {
    id: 'demo-mem-1',
    title: 'Sunrise Walk in the Bamboo Forest 🎋',
    date: '2026-04-12',
    location: 'Arashiyama, Kyoto',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80',
    caption: 'Woke up at 5:30 AM in the morning mist. Having the whole bamboo grove to ourselves was pure magic.',
    secretNote: 'You whispered that this was your favorite sunrise ever.',
    tags: ['Travel', 'Kyoto', 'Sunrise'],
    likesCount: 18,
    cherishedBy: ['creator', 'partner'],
    milestoneId: 'demo-m-1',
  },
  {
    id: 'demo-mem-2',
    title: 'Campfire Stargazing 🔥',
    date: '2026-07-19',
    location: 'Big Sur Redwoods, CA',
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=900&q=80',
    caption: 'The stars were brighter than a city skyline. Wrapped in one big wool blanket all night.',
    secretNote: 'We promised to always make time for the stars.',
    tags: ['Adventure', 'Camping', 'Stars'],
    likesCount: 24,
    cherishedBy: ['creator'],
    milestoneId: 'demo-m-2',
  },
];

// LocalStorage helpers
export const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export const clearAllData = () => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
};

export { STORAGE_KEYS };
