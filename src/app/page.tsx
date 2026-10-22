
"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BarChart3,
  Settings,
  Menu,
  X,
  Target,
  Clock,
  Flame,
  ListTodo,
} from "lucide-react";

import FocusTimer from "@/components/focus/FocusTimer";
import TaskBoard from "@/components/tasks/TaskBoard";
import ProductivityCharts from "@/components/analytics/ProductivityCharts";
import { useFocusStore } from "@/store/useFocusStore";
import type { FocusSession } from "@/types";

type Screen =
  | "Dashboard"
  | "My Tasks"
  | "Focus Timer"
  | "Analytics"
  | "Settings";

const navigation: { name: Screen; icon: typeof LayoutDashboard }[] = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "My Tasks", icon: CheckSquare },
  { name: "Focus Timer", icon: Timer },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

export default function HomePage() {
  const [activeScreen, setActiveScreen] = useState<Screen>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dateText, setDateText] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setMounted(true);

    const now = new Date();

    setDateText(
      now.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );

    setGreeting(
      now.getHours() < 12
        ? "Good morning"
        : now.getHours() < 18
          ? "Good afternoon"
          : "Good evening"
    );
  }, []);

  const tasks = useFocusStore((state) => state.tasks);
  const sessions = useFocusStore((state) => state.sessions);
  const settings = useFocusStore((state) => state.settings);
  const toggleTask = useFocusStore((state) => state.toggleTask);
  const updateSettings = useFocusStore((state) => state.updateSettings);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  const todayFocusMinutes = sessions
    .filter((session: FocusSession) => {
      if (session.mode !== "focus" || !session.completedAt) {
        return false;
      }

      const completedAt = new Date(session.completedAt);
      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      return (
        !Number.isNaN(completedAt.getTime()) &&
        completedAt >= startOfToday &&
        completedAt <= now
      );
    })
    .reduce(
      (total: number, session: FocusSession) =>
        total + (Number(session.durationMinutes) || 0),
      0
    );

  const todayFocusHours = Math.floor(todayFocusMinutes / 60);
  const remainingMinutes = todayFocusMinutes % 60;

  function navigateTo(screen: Screen) {
    setActiveScreen(screen);
    setSidebarOpen(false);
  }

  return (
    <div className="ff-app">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="ff-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`ff-sidebar ${
          sidebarOpen ? "ff-sidebar-open" : ""
        }`}
      >
        <div className="ff-brand">
          <div className="ff-brand-icon">
            <Target size={23} />
          </div>

          <div>
            <h2>FocusFlow</h2>
            <p>Focus on what matters</p>
          </div>

          <button
            type="button"
            className="ff-close-sidebar"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ff-sidebar-label">WORKSPACE</div>

        <nav className="ff-navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => navigateTo(name)}
              className={`ff-nav-item ${
                activeScreen === name ? "ff-nav-item-active" : ""
              }`}
            >
              <Icon size={19} />
              <span>{name}</span>

              {name === "My Tasks" && pendingTasks > 0 && (
                <span className="ff-nav-count">{pendingTasks}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ff-sidebar-bottom">
          <div className="ff-sidebar-tip">
            <div className="ff-tip-icon">
              <Flame size={19} />
            </div>
            <h3>Stay consistent</h3>
            <p>Small focused steps lead to big results.</p>
          </div>

          <p className="ff-sidebar-footer">
            FocusFlow · Build your momentum
          </p>
        </div>
      </aside>

      <main className="ff-main">
        <header className="ff-topbar">
          <div className="ff-topbar-left">
            <button
              type="button"
              aria-label="Open navigation menu"
              className="ff-menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="ff-breadcrumb">
                Workspace / {activeScreen}
              </p>
              <h1>{activeScreen}</h1>
            </div>
          </div>

          <div className="ff-topbar-date">
            <Clock size={16} />
            <span>{dateText || "Loading date..."}</span>
          </div>
        </header>

        <div className="ff-page-content">
          {activeScreen === "Dashboard" && (
            <section className="ff-dashboard">
              <div className="ff-welcome">
                <div>
                  <p className="ff-eyebrow">
                    YOUR PRODUCTIVITY SPACE
                  </p>

                  <h2>{greeting}!</h2>

                  <p>
                    Make today count. One task and one focus session at a
                    time.
                  </p>
                </div>

                <div className="ff-welcome-icon">
                  <Target size={38} />
                </div>
              </div>

              <div className="ff-stats-grid">
                <div className="ff-stat-card">
                  <div className="ff-stat-top">
                    <span>Today&apos;s focus</span>
                    <div className="ff-stat-icon ff-stat-purple">
                      <Timer size={20} />
                    </div>
                  </div>

                  <h3>
                    {todayFocusHours > 0 && `${todayFocusHours}h `}
                    {remainingMinutes}m
                  </h3>

                  <p>Time spent in focus sessions</p>
                </div>

                <div className="ff-stat-card">
                  <div className="ff-stat-top">
                    <span>Tasks completed</span>
                    <div className="ff-stat-icon ff-stat-green">
                      <CheckSquare size={20} />
                    </div>
                  </div>

                  <h3>{completedTasks}</h3>
                  <p>Out of {tasks.length} total tasks</p>
                </div>

                <div className="ff-stat-card">
                  <div className="ff-stat-top">
                    <span>Tasks remaining</span>
                    <div className="ff-stat-icon ff-stat-orange">
                      <ListTodo size={20} />
                    </div>
                  </div>

                  <h3>{pendingTasks}</h3>
                  <p>Keep moving forward</p>
                </div>
              </div>

              <section className="ff-panel">
                <div className="ff-section-heading">
                  <div>
                    <h3>Your tasks</h3>
                    <p>Review your current task list.</p>
                  </div>

                  <button
                    type="button"
                    className="ff-text-button"
                    onClick={() => navigateTo("My Tasks")}
                  >
                    View all
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="ff-empty-state">
                    <ListTodo size={30} />
                    <h4>No tasks yet</h4>

                    <p>
                      Add your first task to start organizing your day.
                    </p>

                    <button
                      type="button"
                      className="ff-primary-button"
                      onClick={() => navigateTo("My Tasks")}
                    >
                      Go to My Tasks
                    </button>
                  </div>
                ) : (
                  <div className="ff-dashboard-task-list">
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        className="ff-dashboard-task"
                        key={task.id}
                      >
                        <label className="ff-task-check">
                          <input
                            type="checkbox"
                            checked={Boolean(task.completed)}
                            onChange={() => toggleTask(task.id)}
                          />

                          <span
                            className={
                              task.completed ? "ff-task-done" : ""
                            }
                          >
                            {task.title}
                          </span>
                        </label>

                        <span
                          className={`ff-task-status ${
                            task.completed ? "ff-status-done" : ""
                          }`}
                        >
                          {task.completed ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="ff-panel ff-quick-actions">
                <div className="ff-section-heading">
                  <div>
                    <h3>Quick actions</h3>
                    <p>Choose what you want to work on next.</p>
                  </div>
                </div>

                <div className="ff-action-grid">
                  <button
                    type="button"
                    className="ff-action-card"
                    onClick={() => navigateTo("My Tasks")}
                  >
                    <CheckSquare size={23} />
                    <span>Manage tasks</span>
                    <small>Organize your work</small>
                  </button>

                  <button
                    type="button"
                    className="ff-action-card"
                    onClick={() => navigateTo("Focus Timer")}
                  >
                    <Timer size={23} />
                    <span>Start focusing</span>
                    <small>Begin a focus session</small>
                  </button>

                  <button
                    type="button"
                    className="ff-action-card"
                    onClick={() => navigateTo("Analytics")}
                  >
                    <BarChart3 size={23} />
                    <span>View analytics</span>
                    <small>Track your progress</small>
                  </button>
                </div>
              </section>
            </section>
          )}

          {activeScreen === "My Tasks" && (
            <section className="ff-screen">
              <div className="ff-screen-intro">
                <h2>Manage your tasks</h2>
                <p>
                  Keep your work organized and check off tasks as you
                  complete them.
                </p>
              </div>

              <TaskBoard />
            </section>
          )}

          {activeScreen === "Focus Timer" && (
            <section className="ff-screen">
              <div className="ff-screen-intro">
                <h2>Make time for deep work</h2>
                <p>
                  Focus on one thing at a time, and give yourself
                  permission to take breaks.
                </p>
              </div>

              <FocusTimer />
            </section>
          )}

          {activeScreen === "Analytics" && (
            <section className="ff-screen">
              <div className="ff-screen-intro">
                <h2>Your productivity</h2>
                <p>
                  See how your focus time changes day by day and week by
                  week.
                </p>
              </div>

              <ProductivityCharts sessions={sessions} />
            </section>
          )}

          {activeScreen === "Settings" && (
            <section className="ff-screen">
              <div className="ff-screen-intro">
                <h2>Personalize FocusFlow</h2>
                <p>
                  Adjust your preferences to fit the way you work.
                </p>
              </div>

              <div className="ff-panel ff-settings-panel">
                <h3>Focus preferences</h3>

                <label className="ff-setting-row">
                  <span>
                    <strong>Focus duration</strong>
                    <small>Minutes per focus session</small>
                  </span>

                  <select
                    value={settings?.focusDuration ?? 25}
                    onChange={(event) =>
                      updateSettings({
                        focusDuration: Number(event.target.value),
                      })
                    }
                  >
                    <option value={15}>15 minutes</option>
                    <option value={25}>25 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </label>

                <label className="ff-setting-row">
                  <span>
                    <strong>Short break</strong>
                    <small>Minutes per short break</small>
                  </span>

                  <select
                    value={settings?.shortBreakDuration ?? 5}
                    onChange={(event) =>
                      updateSettings({
                        shortBreakDuration: Number(event.target.value),
                      })
                    }
                  >
                    <option value={3}>3 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                  </select>
                </label>

                <label className="ff-setting-row">
                  <span>
                    <strong>Long break</strong>
                    <small>Minutes per long break</small>
                  </span>

                  <select
                    value={settings?.longBreakDuration ?? 15}
                    onChange={(event) =>
                      updateSettings({
                        longBreakDuration: Number(event.target.value),
                      })
                    }
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </label>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
