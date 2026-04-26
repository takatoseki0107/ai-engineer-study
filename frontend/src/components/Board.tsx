import type { TaskResponse, TaskStatus } from '../types/task'
import Column from './Column'

interface Props {
  tasks: TaskResponse[]
  onUpdated: (task: TaskResponse) => void
}

const COLUMNS: { status: TaskStatus; label: string; colorClass: string }[] = [
  { status: 'todo', label: 'Todo', colorClass: 'bg-gray-400' },
  { status: 'in_progress', label: '進行中', colorClass: 'bg-blue-400' },
  { status: 'done', label: '完了', colorClass: 'bg-green-400' },
]

export default function Board({ tasks, onUpdated }: Props) {
  return (
    <div className="flex gap-4 items-start">
      {COLUMNS.map((col) => (
        <Column
          key={col.status}
          label={col.label}
          status={col.status}
          colorClass={col.colorClass}
          tasks={tasks.filter((t) => t.status === col.status)}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  )
}
