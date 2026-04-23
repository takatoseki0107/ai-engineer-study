import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, Status } from '../types/task';
import { useTasks } from '../hooks/useTasks';
import Column from './Column';
import TaskModal from './TaskModal';
import { STATUS_LABELS } from '../utils/taskHelpers';
import { taskApi } from '../api/taskApi';

const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo', label: STATUS_LABELS.todo },
  { status: 'in_progress', label: STATUS_LABELS.in_progress },
  { status: 'done', label: STATUS_LABELS.done },
];

export default function Board() {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, reorderTasks } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [filterPriority, setFilterPriority] = useState('');

  // D&D中のoverlayのために一時状態を保持
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getTasksForStatus = (status: Status) =>
    localTasks.filter(t => t.status === status).sort((a, b) => a.position - b.position);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = localTasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = String(over.id);
    const targetStatus: Status | null = overId.startsWith('col-')
      ? (overId.replace('col-', '') as Status)
      : (localTasks.find(t => t.id === Number(over.id))?.status ?? null);

    if (!targetStatus || activeTask.status === targetStatus) return;

    setLocalTasks(prev => prev.map(t =>
      t.id === activeTask.id ? { ...t, status: targetStatus } : t
    ));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = localTasks.find(t => t.id === Number(active.id));
    if (!activeTask) return;

    const overId = String(over.id);
    const targetStatus: Status = overId.startsWith('col-')
      ? (overId.replace('col-', '') as Status)
      : (localTasks.find(t => t.id === Number(over.id))?.status ?? activeTask.status);

    const columnTasks = localTasks
      .filter(t => t.status === targetStatus)
      .sort((a, b) => a.position - b.position);

    const oldIndex = columnTasks.findIndex(t => t.id === activeTask.id);
    const overTask = localTasks.find(t => t.id === Number(over.id));
    const newIndex = overTask && overTask.status === targetStatus
      ? columnTasks.findIndex(t => t.id === overTask.id)
      : columnTasks.length - 1;

    let reordered = columnTasks;
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reordered = arrayMove(columnTasks, oldIndex, newIndex);
    }

    const updated = reordered.map((t, i) => ({ ...t, status: targetStatus, position: i }));
    const otherTasks = localTasks.filter(t => t.status !== targetStatus);
    const newTasks = [...otherTasks, ...updated].sort((a, b) => {
      if (a.status !== b.status) return a.status.localeCompare(b.status);
      return a.position - b.position;
    });

    reorderTasks(newTasks);

    // APIへ一括更新
    await Promise.all(
      updated.map(t => taskApi.update(t.id, { status: t.status, position: t.position }))
    );
  };

  const handleCreate = async (data: { title: string; description: string; priority: string; status: Status; due_date: string }) => {
    await createTask({
      title: data.title,
      description: data.description || undefined,
      priority: data.priority || undefined,
      status: data.status,
      due_date: data.due_date || undefined,
    });
  };

  const handleEdit = async (data: { title: string; description: string; priority: string; status: Status; due_date: string }) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority || null,
      status: data.status,
      due_date: data.due_date || null,
    });
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    await deleteTask(editingTask.id);
  };

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">タスクボード</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">優先度で絞り込み:</label>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white cursor-pointer"
            >
              <option value="">すべて</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
      </header>

      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">読み込み中...</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-4">
            {COLUMNS.map(({ status, label }) => (
              <Column
                key={status}
                status={status}
                label={label}
                tasks={getTasksForStatus(status)}
                filterPriority={filterPriority}
                onAddClick={() => {
                  setEditingTask(null);
                  setDefaultStatus(status);
                  setModalOpen(true);
                }}
                onCardClick={task => {
                  setEditingTask(task);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        </DndContext>
      )}

      {modalOpen && !editingTask && (
        <TaskModal
          mode="create"
          defaultStatus={defaultStatus}
          onSave={handleCreate}
          onClose={() => setModalOpen(false)}
        />
      )}

      {modalOpen && editingTask && (
        <TaskModal
          mode="edit"
          task={editingTask}
          onSave={handleEdit}
          onDelete={handleDelete}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
