import { Droppable } from '@hello-pangea/dnd'
import type { TaskResponse, TaskStatus } from '../types/task'
import TaskCard from './TaskCard'

interface Props {
  label: string
  status: TaskStatus
  tasks: TaskResponse[]
  colorClass: string
  onUpdated: (task: TaskResponse) => void
}

export default function Column({ label, status, tasks, colorClass, onUpdated }: Props) {
  return (
    <div className="flex-1 min-w-0 bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
        <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
        <span className="ml-auto text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2 min-h-16 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onUpdated={onUpdated} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-gray-400 text-center py-4">タスクなし</p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
