import { create } from 'zustand';
import { SessionType, SESSION_TYPES, TIMER_DEFAULTS } from '../constants/timer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartNext: boolean;
  darkMode: boolean | null; // null = follow system
}

interface TimerState {
  mode: SessionType;
  timeLeft: number; // seconds
  isRunning: boolean;
  endTimestamp: number | null; // epoch ms
  sessionCount: number; // focus sessions completed today
  completedSessions: number; // focus sessions in a row (for long break trigger)
  settings: Settings;
  setMode: (mode: SessionType) => void;
  setTimeLeft: (t: number) => void;
  setIsRunning: (v: boolean) => void;
  setEndTimestamp: (ts: number | null) => void;
  incrementSessionCount: () => void;
  incrementCompletedSessions: () => void;
  resetCompletedSessions: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  loadSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  focusMin: TIMER_DEFAULTS.FOCUS_MIN,
  shortBreakMin: TIMER_DEFAULTS.SHORT_BREAK_MIN,
  longBreakMin: TIMER_DEFAULTS.LONG_BREAK_MIN,
  sessionsBeforeLongBreak: TIMER_DEFAULTS.SESSIONS_BEFORE_LONG_BREAK,
  soundEnabled: true,
  vibrationEnabled: true,
  autoStartNext: false,
  darkMode: null,
};

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: SESSION_TYPES.FOCUS,
  timeLeft: TIMER_DEFAULTS.FOCUS_MIN * 60,
  isRunning: false,
  endTimestamp: null,
  sessionCount: 0,
  completedSessions: 0,
  settings: DEFAULT_SETTINGS,

  setMode: (mode) => {
    const { settings } = get();
    const durations: Record<SessionType, number> = {
      [SESSION_TYPES.FOCUS]: settings.focusMin * 60,
      [SESSION_TYPES.SHORT_BREAK]: settings.shortBreakMin * 60,
      [SESSION_TYPES.LONG_BREAK]: settings.longBreakMin * 60,
    };
    set({ mode, timeLeft: durations[mode], isRunning: false, endTimestamp: null });
  },

  setTimeLeft: (t) => set({ timeLeft: t }),
  setIsRunning: (v) => set({ isRunning: v }),
  setEndTimestamp: (ts) => set({ endTimestamp: ts }),
  incrementSessionCount: () => set((s) => ({ sessionCount: s.sessionCount + 1 })),
  incrementCompletedSessions: () => set((s) => ({ completedSessions: s.completedSessions + 1 })),
  resetCompletedSessions: () => set({ completedSessions: 0 }),

  updateSettings: async (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    await AsyncStorage.setItem('settings', JSON.stringify(updated));
  },

  loadSettings: async () => {
    const raw = await AsyncStorage.getItem('settings');
    if (raw) {
      const parsed: Settings = JSON.parse(raw);
      set({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
    }
  },
}));
