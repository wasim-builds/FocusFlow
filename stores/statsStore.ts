import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Session {
  id: string;
  type: 'focus' | 'short_break' | 'long_break';
  durationSec: number;
  completedAt: number;
  taskId?: string;
}

interface StatsState {
  sessions: Session[];
  loadSessions: () => Promise<void>;
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  getTodayFocusSec: () => number;
  getWeekFocusSec: () => number;
  getTodayPomodoros: () => number;
  getStreak: () => number;
}

const saveSessions = (sessions: Session[]) =>
  AsyncStorage.setItem('sessions', JSON.stringify(sessions));

export const useStatsStore = create<StatsState>((set, get) => ({
  sessions: [],

  loadSessions: async () => {
    const raw = await AsyncStorage.getItem('sessions');
    if (raw) set({ sessions: JSON.parse(raw) });
  },

  addSession: async (session) => {
    const newSession: Session = { ...session, id: `session-${Date.now()}` };
    const sessions = [newSession, ...get().sessions];
    set({ sessions });
    await saveSessions(sessions);
  },

  getTodayFocusSec: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get()
      .sessions.filter(
        (s) => s.type === 'focus' && s.completedAt >= today.getTime()
      )
      .reduce((acc, s) => acc + s.durationSec, 0);
  },

  getWeekFocusSec: () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return get()
      .sessions.filter((s) => s.type === 'focus' && s.completedAt >= weekAgo)
      .reduce((acc, s) => acc + s.durationSec, 0);
  },

  getTodayPomodoros: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().sessions.filter(
      (s) => s.type === 'focus' && s.completedAt >= today.getTime()
    ).length;
  },

  getStreak: () => {
    const sessions = get().sessions.filter((s) => s.type === 'focus');
    if (sessions.length === 0) return 0;

    const getDay = (ts: number) => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const uniqueDays = [...new Set(sessions.map((s) => getDay(s.completedAt)))].sort(
      (a, b) => b - a
    );

    const today = getDay(Date.now());
    if (uniqueDays[0] !== today && uniqueDays[0] !== today - 86400000) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      if (uniqueDays[i - 1] - uniqueDays[i] === 86400000) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },
}));
