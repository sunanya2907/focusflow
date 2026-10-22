
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Task,
  TaskPriority,
  FocusSession,
  TimerMode,
  FocusSettings,
  TaskFilter,
} from "@/types";

type NewTask = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedMinutes?: number;
};

type FocusStore = {
  tasks: Task[];
  sessions: FocusSession[];
  settings: FocusSettings;
  filter: TaskFilter;

  addTask: (task: NewTask) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;

  addSession: (session: Omit<FocusSession, "id" | "completedAt"> & {
    completedAt?: number;
  }) => void;

  updateSettings: (updates: Partial<FocusSettings>) => void;
  clearSessions: () => void;
};

const defaultSettings: FocusSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

const starterTasks: Task[] = [
  {
    id: "starter-1",
    title: "Finish React dashboard UI",
    description: "Polish the FocusFlow dashboard",
    priority: "high",
    completed: false,
    createdAt: Date.now(),
    estimatedMinutes: 60,
  },
  {
    id: "starter-2",
    title: "Review project documentation",
    priority: "medium",
    completed: false,
    createdAt: Date.now(),
    estimatedMinutes: 30,
  },
  {
    id: "starter-3",
    title: "Practice JavaScript problems",
    priority: "high",
    completed: false,
    createdAt: Date.now(),
    estimatedMinutes: 45,
  },
];

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      tasks: starterTasks,
      sessions: [],
      settings: defaultSettings,
      filter: "all",

      addTask: (task) => {
        const title = task.title.trim();

        if (!title) return;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description: task.description?.trim() || undefined,
          priority: task.priority ?? "medium",
          completed: false,
          createdAt: Date.now(),
          dueDate: task.dueDate || undefined,
          estimatedMinutes: task.estimatedMinutes,
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed }
              : task
          ),
        })),

      setFilter: (filter) => set({ filter }),

      addSession: (session) =>
        set((state) => ({
          sessions: [
            {
              ...session,
              id: crypto.randomUUID(),
              completedAt: session.completedAt ?? Date.now(),
            },
            ...state.sessions,
          ],
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        })),

      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: "focusflow-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
