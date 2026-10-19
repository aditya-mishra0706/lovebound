export type ThemeMode = 'cosmic' | 'lovey' | 'warm' | 'oled' | 'lavender';
export type CelebrationEffect = 'confetti' | 'hearts' | 'fireworks' | 'sparkles';

export interface UserProfile {
  id: string; // 'creator' | 'partner'
  name: string;
  avatar: string; // emoji or image
  email: string;
  age: string;
  gender: string;
  streakDays: number;
  statusText: string;
  isDeepWork: boolean;
  focusMinutesToday: number;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  ownerId: 'creator' | 'partner' | 'shared' | string;
  category?: string;
  dueDate?: string;
  createdAt: string;
}

export interface CoupleGoal {
  id: string;
  title: string;
  category: 'finance' | 'travel' | 'wellness' | 'home' | 'romance';
  targetAmount: number;
  currentAmount: number;
  unit: string; // '$', 'dates', 'books', 'places', '%'
  deadline: string;
  notes: string;
  completed: boolean;
  assignedTo: 'together' | 'me' | 'partner';
  icon: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  category: 'anniversary' | 'travel' | 'life' | 'achievement';
  icon: string;
  completed: boolean;
  description: string;
  photoUrl?: string;
}

export interface PhotoMemory {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  caption: string;
  secretNote?: string;
  tags: string[];
  likesCount: number;
  cherishedBy: string[]; // user ids
  milestoneId?: string;
}

export interface TreeState {
  level: number;
  points: number;
  maxPoints: number;
  stageName: string;
  waterCountToday: number;
}

export interface AuthSession {
  isLoggedIn: boolean;
  myPairingCode: string;
  userRole: 'creator' | 'partner';
  isPaired: boolean;
  partnerName?: string;
  partnerAvatar?: string;
  connectedAt?: string;
}

export interface CoupleSettings {
  coupleName: string;
  togetherSince: string; // '2025-10-30'
  theme: ThemeMode;
  celebrationFx: CelebrationEffect;
  cheersAndNudges: boolean;
  partnerActivityAlerts: boolean;
  soundAndHaptics: boolean;
  language: string;
}
