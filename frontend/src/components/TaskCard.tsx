import type { TaskResponse } from '../types/task'

interface Props {
  task: TaskResponse
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

export default function TaskCard({ task }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = task.dueDate !== null && task.dueDate < today && task.status !== 'done'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 space-y-2">
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
    </div>
  )
}
