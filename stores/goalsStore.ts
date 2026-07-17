import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'goals';

export interface Goals {
  dailyFocusMin: number;   // default 120
  weeklyFocusMin: number;  // default 600
}

interface GoalsState {
  goals: Goals;
  updateGoals: (g: Partial<Goals>) => Promise<void>;
  loadGoals: () => Promise<void>;
  /** Returns a 0–1 progress ratio for today's focus against the daily goal. */
  getDailyProgress: (todaySec: number) => number;
  /** Returns a 0–1 progress ratio for this week's focus against the weekly goal. */
  getWeeklyProgress: (weekSec: number) => number;
}

const DEFAULT_GOALS: Goals = {
  dailyFocusMin: 120,
  weeklyFocusMin: 600,
};

const saveGoals = (goals: Goals) =>
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: DEFAULT_GOALS,

  loadGoals: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Goals = JSON.parse(raw);
      set({ goals: { ...DEFAULT_GOALS, ...parsed } });
    }
  },

  updateGoals: async (partial) => {
    const updated: Goals = { ...get().goals, ...partial };
    set({ goals: updated });
    await saveGoals(updated);
  },

  getDailyProgress: (todaySec: number) => {
    const { dailyFocusMin } = get().goals;
    if (dailyFocusMin <= 0) return 1;
    return Math.min(1, todaySec / (dailyFocusMin * 60));
  },

  getWeeklyProgress: (weekSec: number) => {
    const { weeklyFocusMin } = get().goals;
    if (weeklyFocusMin <= 0) return 1;
    return Math.min(1, weekSec / (weeklyFocusMin * 60));
  },
}));
