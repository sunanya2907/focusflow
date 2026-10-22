
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
  estimatedMinutes?: number;
};

export type TimerMode = "focus" | "shortBreak" | "longBreak";

export type FocusSession = {
  id: string;
  mode: TimerMode;
  durationMinutes: number;
  completedAt: number;
  taskId?: string;
};

export type FocusSettings = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
};

export type TaskFilter = "all" | "active" | "completed";
