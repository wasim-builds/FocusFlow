import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  isDone: boolean;
  pomodorosCompleted: number;
  createdAt: number;
}

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (title: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  incrementPomodoro: (id: string) => void;
  loadTasks: () => Promise<void>;
}

const saveTasks = async (tasks: Task[]) => {
  await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activeTaskId: null,

  addTask: (title) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      isDone: false,
      pomodorosCompleted: 0,
      createdAt: Date.now(),
    };
    const tasks = [task, ...get().tasks];
    set({ tasks });
    saveTasks(tasks);
  },

  updateTask: (id, updates) => {
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    set({ tasks });
    saveTasks(tasks);
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    const activeTaskId = get().activeTaskId === id ? null : get().activeTaskId;
    set({ tasks, activeTaskId });
    saveTasks(tasks);
  },

  toggleTask: (id) => {
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t));
    set({ tasks });
    saveTasks(tasks);
  },

  setActiveTask: (id) => set({ activeTaskId: id }),

  incrementPomodoro: (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, pomodorosCompleted: t.pomodorosCompleted + 1 } : t
    );
    set({ tasks });
    saveTasks(tasks);
  },

  loadTasks: async () => {
    const raw = await AsyncStorage.getItem('tasks');
    if (raw) set({ tasks: JSON.parse(raw) });
  },
}));
