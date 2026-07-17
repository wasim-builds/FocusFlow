import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'badges';

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt: number | null; // epoch ms, null = locked
}

interface AchievementsState {
  badges: Badge[];
  loadBadges: () => Promise<void>;
  unlockBadge: (id: string) => Promise<void>;
  checkAndUnlock: (stats: {
    totalPomodoros: number;
    streak: number;
    todaySec: number;
  }) => Promise<void>;
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_pomodoro',
    title: 'First Tomato',
    description: 'Complete your first Pomodoro',
    emoji: '🍅',
    unlockedAt: null,
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    description: '3-day streak',
    emoji: '🔥',
    unlockedAt: null,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: '7-day streak',
    emoji: '⚡',
    unlockedAt: null,
  },
  {
    id: 'streak_30',
    title: 'Iron Focus',
    description: '30-day streak',
    emoji: '🏆',
    unlockedAt: null,
  },
  {
    id: 'pomodoro_10',
    title: 'Getting Started',
    description: 'Complete 10 Pomodoros',
    emoji: '🎯',
    unlockedAt: null,
  },
  {
    id: 'pomodoro_50',
    title: 'Focused',
    description: 'Complete 50 Pomodoros',
    emoji: '💪',
    unlockedAt: null,
  },
  {
    id: 'pomodoro_100',
    title: 'Centurion',
    description: 'Complete 100 Pomodoros',
    emoji: '🦁',
    unlockedAt: null,
  },
  {
    id: 'focus_60',
    title: 'Hour Down',
    description: 'Focus for 60 minutes in a day',
    emoji: '⏰',
    unlockedAt: null,
  },
  {
    id: 'focus_240',
    title: 'Deep Worker',
    description: 'Focus for 4 hours in a day',
    emoji: '🧠',
    unlockedAt: null,
  },
];

/**
 * Returns true if the badge condition is met given the provided stats.
 */
const isBadgeConditionMet = (
  id: string,
  stats: { totalPomodoros: number; streak: number; todaySec: number }
): boolean => {
  switch (id) {
    case 'first_pomodoro':
      return stats.totalPomodoros >= 1;
    case 'streak_3':
      return stats.streak >= 3;
    case 'streak_7':
      return stats.streak >= 7;
    case 'streak_30':
      return stats.streak >= 30;
    case 'pomodoro_10':
      return stats.totalPomodoros >= 10;
    case 'pomodoro_50':
      return stats.totalPomodoros >= 50;
    case 'pomodoro_100':
      return stats.totalPomodoros >= 100;
    case 'focus_60':
      return stats.todaySec >= 60 * 60; // 1 hour in seconds
    case 'focus_240':
      return stats.todaySec >= 4 * 60 * 60; // 4 hours in seconds
    default:
      return false;
  }
};

const saveBadges = (badges: Badge[]) =>
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(badges));

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  badges: INITIAL_BADGES,

  loadBadges: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const persisted: Badge[] = JSON.parse(raw);
      // Merge persisted unlock timestamps into the canonical badge list so new
      // badges added in future releases also appear.
      const merged = INITIAL_BADGES.map((b) => {
        const saved = persisted.find((p) => p.id === b.id);
        return saved ? { ...b, unlockedAt: saved.unlockedAt } : b;
      });
      set({ badges: merged });
    }
  },

  unlockBadge: async (id: string) => {
    const badges = get().badges.map((b) =>
      b.id === id && b.unlockedAt === null
        ? { ...b, unlockedAt: Date.now() }
        : b
    );
    set({ badges });
    await saveBadges(badges);
  },

  checkAndUnlock: async (stats) => {
    const { badges, unlockBadge } = get();
    const locked = badges.filter((b) => b.unlockedAt === null);
    for (const badge of locked) {
      if (isBadgeConditionMet(badge.id, stats)) {
        await unlockBadge(badge.id);
      }
    }
  },
}));
