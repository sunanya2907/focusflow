
"use client";

import { useEffect, useState } from "react";
import { useFocusStore } from "@/store/useFocusStore";
import type { FocusSession } from "@/types";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const MODES: { id: TimerMode; label: string }[] = [
  { id: "focus", label: "Focus" },
  { id: "shortBreak", label: "Short Break" },
  { id: "longBreak", label: "Long Break" },
];

export default function FocusTimer() {
  const settings = useFocusStore((state) => state.settings);

  const [mode, setMode] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(
    Math.max(1, settings.focusDuration) * 60
  );
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const durationForMode = (selectedMode: TimerMode) => {
    switch (selectedMode) {
      case "shortBreak":
        return settings.shortBreakDuration;
      case "longBreak":
        return settings.longBreakDuration;
      default:
        return settings.focusDuration;
    }
  };

  const totalSeconds = Math.max(1, durationForMode(mode)) * 60;

  useEffect(() => {
    if (!running) return;

    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setRunning(false);
          setCompleted(true);

          if (mode === "focus") {
            const session: FocusSession = {
              id: crypto.randomUUID(),
              mode: "focus",
              completedAt: Date.now(),
              durationMinutes: Math.max(
                1,
                durationForMode("focus")
              ),
            };

            // Save the completed session using the existing store.
            useFocusStore.setState((state) => ({
              sessions: [...state.sessions, session],
            }));
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running, mode]);

  // Keep the timer duration aligned with the selected settings.
  useEffect(() => {
    if (!running) {
      setRemaining(totalSeconds);
    }
  }, [
    mode,
    settings.focusDuration,
    settings.shortBreakDuration,
    settings.longBreakDuration,
  ]);

  const selectMode = (nextMode: TimerMode) => {
    setRunning(false);
    setCompleted(false);
    setMode(nextMode);
    setRemaining(Math.max(1, durationForMode(nextMode)) * 60);
  };

  const resetTimer = () => {
    setRunning(false);
    setCompleted(false);
    setRemaining(totalSeconds);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  const progress = Math.min(
    100,
    Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100)
  );

  return (
    <section className="ff-timer">
      <div className="ff-timer-heading">
        <p className="ff-timer-eyebrow">FOCUSFLOW TIMER</p>
        <h2>Focus on what matters</h2>
        <p>Small focused steps lead to big results.</p>
      </div>

      <div className="ff-timer-modes" role="group" aria-label="Timer mode">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              mode === item.id
                ? "ff-timer-mode active"
                : "ff-timer-mode"
            }
            onClick={() => selectMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="ff-timer-clock" aria-live="polite">
        <div className="ff-timer-time">{formatTime(remaining)}</div>
        <p>
          {completed
            ? mode === "focus"
              ? "Focus session completed!"
              : "Break completed!"
            : running
              ? mode === "focus"
                ? "You're in a focus session"
                : "Enjoy your break"
              : "Ready when you are"}
        </p>
      </div>

      <div
        className="ff-timer-progress"
        role="progressbar"
        aria-label="Timer progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="ff-timer-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="ff-timer-controls">
        <button
          type="button"
          className="ff-timer-primary"
          onClick={() => {
            if (remaining === 0) {
              setRemaining(totalSeconds);
              setCompleted(false);
            }

            setRunning((value) => !value);
          }}
        >
          {running ? "Pause" : remaining === 0 ? "Start again" : "Start"}
        </button>

        <button
          type="button"
          className="ff-timer-secondary"
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>

      <div className="ff-timer-note">
        <span className="ff-timer-dot" />
        {mode === "focus"
          ? `${durationForMode("focus")} minute focus session`
          : `${durationForMode(mode)} minute break`}
      </div>
    </section>
  );
}
