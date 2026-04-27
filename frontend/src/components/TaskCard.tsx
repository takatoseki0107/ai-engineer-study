import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import type { TaskResponse } from '../types/task'
import { deleteTask } from '../api/taskApi'
import TaskDetailModal from './TaskDetailModal'

interface Props {
  task: TaskResponse
  index: number
  onUpdated: (task: TaskResponse) => void
  onDeleted: (id: number) => void
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

export default function TaskCard({ task, index, onUpdated, onDeleted }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = task.dueDate !== null && task.dueDate < today && task.status !== 'done'

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`「${task.title}」を削除しますか？`)) return
    await deleteTask(task.id)
    onDeleted(task.id)
  }

  return (
    <>
      <Draggable draggableId={String(task.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`group bg-white rounded-lg shadow-sm border border-gray-200 p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow ${
              snapshot.isDragging ? 'shadow-lg rotate-1 opacity-90' : ''
            }`}
            onClick={() => setModalOpen(true)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
              <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity flex-shrink-0 text-base leading-none"
                title="削除"
              >
                🗑
              </button>
            </div>

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
        )}
      </Draggable>

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
