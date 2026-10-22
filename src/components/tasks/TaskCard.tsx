"use client";

import { Check, Clock, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types";

type TaskCardProps = {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskCardProps) {
  return (
    <article className="group flex items-start sm:items-center gap-4 py-4 border-b border-[#263248] last:border-0">
      <button
        className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded border transition-colors cursor-pointer ${
          task.completed
            ? "bg-[#818cf8] border-[#818cf8] text-[#101329]"
            : "border-[#53627a] bg-transparent hover:border-[#818cf8]"
        }`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        onClick={() => onToggle(task.id)}
      >
        {task.completed && <Check size={13} strokeWidth={3} />}
      </button>

      <div className="flex flex-col flex-1 min-w-0">
        <div
          className={`text-[13px] font-medium leading-relaxed break-words ${
            task.completed
              ? "text-[#78869a] line-through decoration-[#7b89a0]"
              : "text-[#e2e8f0]"
          }`}
        >
          {task.title}
        </div>

        {task.description && (
          <p className="text-[12px] text-[#8b9ab1] mt-1.5 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-2.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
              task.priority === "high"
                ? "bg-[#391c22] text-[#fb7185]"
                : task.priority === "medium"
                ? "bg-[#30271b] text-[#fbbf24]"
                : "bg-[#15372f] text-[#6ee7b7]"
            }`}
          >
            {task.priority || "low"}
          </span>

          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-[11px] text-[#78869a]">
              <Clock size={12} />
              {task.estimatedMinutes} min
            </span>
          )}

          {task.dueDate && (
            <span className="text-[11px] text-[#78869a]">
              Due {task.dueDate}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="text-[#78869a] hover:text-[#c7d2fe] p-1.5 rounded hover:bg-[#202e46] transition-colors"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          title="Edit task"
        >
          <Pencil size={15} />
        </button>

        <button
          className="text-[#78869a] hover:text-[#fb7185] p-1.5 rounded hover:bg-[#391c22] transition-colors"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          title="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}