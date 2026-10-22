
"use client";

import { useEffect, useState } from "react";
import type { Task, TaskPriority } from "@/types";

type TaskModalProps = {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
    estimatedMinutes?: number;
  }) => void;
};

export default function TaskModal({
  open,
  task,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  useEffect(() => {
    if (!open) return;

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "medium");
    setDueDate(task?.dueDate ?? "");
    setEstimatedMinutes(
      task?.estimatedMinutes ? String(task.estimatedMinutes) : ""
    );
  }, [open, task]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const minutes = Number(estimatedMinutes);

    onSave({
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      estimatedMinutes:
        estimatedMinutes && Number.isFinite(minutes) && minutes > 0
          ? minutes
          : undefined,
    });

    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="task-modal-header">
          <h2 id="task-modal-title">
            {task ? "Edit task" : "Create a task"}
          </h2>

          <button
            type="button"
            className="task-action"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Task title
            <input
              autoFocus
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you want to accomplish?"
            />
          </label>

          <label>
            Description
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add details (optional)"
            />
          </label>

          <div className="task-form-grid">
            <label>
              Priority
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label>
              Estimate (minutes)
              <input
                type="number"
                min="1"
                max="1440"
                value={estimatedMinutes}
                onChange={(event) =>
                  setEstimatedMinutes(event.target.value)
                }
                placeholder="e.g. 30"
              />
            </label>
          </div>

          <label>
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>

          <footer className="task-modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary-button">
              {task ? "Save changes" : "Add task"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
