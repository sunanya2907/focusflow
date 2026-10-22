"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useFocusStore } from "@/store/useFocusStore";
import type { Task, TaskPriority, TaskFilter } from "@/types";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

export default function TaskBoard() {
  const tasks = useFocusStore((state) => state.tasks);
  const filter = useFocusStore((state) => state.filter);
  const addTask = useFocusStore((state) => state.addTask);
  const updateTask = useFocusStore((state) => state.updateTask);
  const deleteTask = useFocusStore((state) => state.deleteTask);
  const toggleTask = useFocusStore((state) => state.toggleTask);
  const setFilter = useFocusStore((state) => state.setFilter);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "completed" && task.completed);

      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function saveTask(values: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
    estimatedMinutes?: number;
  }) {
    if (editingTask) {
      updateTask(editingTask.id, values);
    } else {
      addTask(values);
    }
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this task? This cannot be undone.")) {
      deleteTask(id);
    }
  }

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

  const filters: { label: string; value: TaskFilter }[] = [
    { label: "All tasks", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[#94a3b8] text-sm">
            {activeCount} remaining · {completedCount} completed
          </p>
        </div>

        <button className="ff-primary-button" onClick={openCreateModal}>
          <Plus size={16} />
          New task
        </button>
      </header>

      <div className="ff-panel flex flex-col sm:flex-row gap-4 items-center justify-between !py-4 !px-5">
        <div className="flex items-center gap-2 bg-[#0b1322] border border-[#36445b] rounded-lg px-3 py-2 w-full sm:max-w-xs focus-within:border-[#818cf8] transition-colors">
          <Search size={16} className="text-[#7c8ba1]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="bg-transparent border-none outline-none text-[#e2e8f0] w-full text-sm placeholder-[#7c8ba1]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {filters.map((item) => (
            <button
              key={item.value}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filter === item.value
                  ? "bg-[#818cf8] text-[#101329]"
                  : "bg-[#182338] text-[#e2e8f0] hover:bg-[#202e46]"
              }`}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ff-panel !p-0 overflow-hidden">
        {visibleTasks.length > 0 ? (
          <div className="ff-dashboard-task-list px-6 py-2">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="ff-empty-state !py-16">
            <h3>No tasks found</h3>
            <p>Try another filter or create a new task.</p>
          </div>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={saveTask}
      />
    </section>
  );
}