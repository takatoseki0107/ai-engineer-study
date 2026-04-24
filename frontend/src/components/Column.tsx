import type { TaskResponse, TaskStatus } from '../types/task'
import TaskCard from './TaskCard'

interface Props {
  label: string
  status: TaskStatus
  tasks: TaskResponse[]
  colorClass: string
}

export default function Column({ label, tasks, colorClass }: Props) {
  return (
    <div className="flex-1 min-w-0 bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
      <div className={`flex items-center gap-2 pb-2 border-b border-gray-200`}>
        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
        <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
        <span className="ml-auto text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">タスクなし</p>
        )}
      </div>
    </div>
  )
}
