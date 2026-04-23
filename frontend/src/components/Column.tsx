import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Task, Status } from '../types/task';
import TaskCard from './TaskCard';

type SortOrder = 'default' | 'priority' | 'due_date';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

type Props = {
  status: Status;
  label: string;
  tasks: Task[];
  filterPriority: string;
  onAddClick: () => void;
  onCardClick: (task: Task) => void;
};

export default function Column({ status, label, tasks, filterPriority, onAddClick, onCardClick }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status}` });

  const filtered = filterPriority
    ? tasks.filter(t => t.priority === filterPriority)
    : tasks;

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'priority') {
      const pa = a.priority ? PRIORITY_ORDER[a.priority] : 99;
      const pb = b.priority ? PRIORITY_ORDER[b.priority] : 99;
      return pa - pb;
    }
    if (sortOrder === 'due_date') {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }
    return a.position - b.position;
  });

  const COLUMN_COLORS: Record<Status, string> = {
    todo: 'bg-gray-100 border-t-gray-400',
    in_progress: 'bg-blue-50 border-t-blue-400',
    done: 'bg-green-50 border-t-green-400',
  };

  return (
    <div className={`flex flex-col rounded-xl border-t-4 ${COLUMN_COLORS[status]} ${isOver ? 'ring-2 ring-blue-300' : ''} w-72 min-w-[18rem] shadow-sm`}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-700 text-sm">{label}</h2>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </div>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            className="text-xs text-gray-500 border border-gray-200 rounded px-1 py-0.5 bg-white cursor-pointer"
          >
            <option value="default">並び順</option>
            <option value="priority">優先度順</option>
            <option value="due_date">期限順</option>
          </select>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 px-3 pb-3 flex flex-col gap-2 min-h-[4rem]">
        <SortableContext items={sorted.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {sorted.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onCardClick(task)} />
          ))}
        </SortableContext>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onAddClick}
          className="w-full text-left text-sm text-gray-500 px-3 py-2 rounded hover:bg-gray-200/60 transition-colors cursor-pointer"
        >
          ＋ タスクを追加
        </button>
      </div>
    </div>
  );
}
