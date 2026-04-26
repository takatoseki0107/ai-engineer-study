import { useState } from 'react'
import type { TaskResponse, TaskStatus } from '../types/task'
import { updateTaskStatus } from '../api/taskApi'
import TaskDetailModal from './TaskDetailModal'

interface Props {
  task: TaskResponse
  onUpdated: (task: TaskResponse) => void
}

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const STATUS_TRANSITIONS: Record<TaskStatus, { label: string; next: TaskStatus }[]> = {
  todo: [{ label: '→ 進行中', next: 'in_progress' }],
  in_progress: [
    { label: '← 戻す', next: 'todo' },
    { label: '→ 完了', next: 'done' },
  ],
  done: [{ label: '← 戻す', next: 'in_progress' }],
}

export default function TaskCard({ task, onUpdated }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = task.dueDate !== null && task.dueDate < today && task.status !== 'done'

  const handleStatusChange = async (e: React.MouseEvent, next: TaskStatus) => {
    e.stopPropagation()
    setStatusUpdating(true)
    try {
      const updated = await updateTaskStatus(task.id, next)
      onUpdated(updated)
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setModalOpen(true)}
      >
        <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>

        {task.description && (
          <p className="text-xs text-gray-500 truncate">{task.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {task.priority && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority]}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
              {task.dueDate}
            </span>
          )}
        </div>

        <div
          className="flex gap-1 pt-1 border-t border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {STATUS_TRANSITIONS[task.status].map(({ label, next }) => (
            <button
              key={next}
              onClick={(e) => handleStatusChange(e, next)}
              disabled={statusUpdating}
              className="text-xs px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {modalOpen && (
        <TaskDetailModal
          task={task}
          onClose={() => setModalOpen(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  )
}
