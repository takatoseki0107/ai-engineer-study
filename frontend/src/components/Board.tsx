import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import type { TaskResponse, TaskStatus } from '../types/task'
import { updateTaskStatus, updateTaskPosition } from '../api/taskApi'
import Column from './Column'

interface Props {
  tasks: TaskResponse[]
  onUpdated: (task: TaskResponse) => void
  onReordered: (tasks: TaskResponse[]) => void
  onDeleted: (id: number) => void
}

const COLUMNS: { status: TaskStatus; label: string; colorClass: string }[] = [
  { status: 'todo', label: 'Todo', colorClass: 'bg-gray-400' },
  { status: 'in_progress', label: '進行中', colorClass: 'bg-blue-400' },
  { status: 'done', label: '完了', colorClass: 'bg-green-400' },
]

export default function Board({ tasks, onUpdated, onReordered, onDeleted }: Props) {
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const taskId = parseInt(draggableId, 10)
    const sourceStatus = source.droppableId as TaskStatus
    const destStatus = destination.droppableId as TaskStatus

    // 楽観的UI更新
    const sourceTasks = tasks
      .filter((t) => t.status === sourceStatus)
      .sort((a, b) => a.position - b.position)
    const destTasks =
      sourceStatus === destStatus
        ? sourceTasks
        : tasks.filter((t) => t.status === destStatus).sort((a, b) => a.position - b.position)

    const [moved] = sourceTasks.splice(source.index, 1)
    const movedWithNewStatus: TaskResponse = { ...moved, status: destStatus }

    if (sourceStatus === destStatus) {
      sourceTasks.splice(destination.index, 0, movedWithNewStatus)
      const updatedTasks = tasks.map((t) => {
        const idx = sourceTasks.findIndex((s) => s.id === t.id)
        return idx !== -1 ? { ...sourceTasks[idx], position: idx + 1 } : t
      })
      onReordered(updatedTasks)
    } else {
      destTasks.splice(destination.index, 0, movedWithNewStatus)
      const updatedTasks = tasks.map((t) => {
        const srcIdx = sourceTasks.findIndex((s) => s.id === t.id)
        if (srcIdx !== -1) return { ...sourceTasks[srcIdx], position: srcIdx + 1 }
        const dstIdx = destTasks.findIndex((d) => d.id === t.id)
        if (dstIdx !== -1) return { ...destTasks[dstIdx], position: dstIdx + 1 }
        return t
      })
      onReordered(updatedTasks)
    }

    // APIコール
    try {
      if (sourceStatus !== destStatus) {
        const updated = await updateTaskStatus(taskId, destStatus)
        onUpdated(updated)
      }
      await updateTaskPosition(taskId, destination.index + 1)
    } catch {
      // 失敗時は再フェッチで整合性を回復させる（App側に委ねる）
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 items-start">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            label={col.label}
            status={col.status}
            colorClass={col.colorClass}
            tasks={tasks
              .filter((t) => t.status === col.status)
              .sort((a, b) => a.position - b.position)}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
