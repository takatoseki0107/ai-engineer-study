export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface TaskResponse {
  id: number
  title: string
  description: string | null
  priority: TaskPriority | null
  status: TaskStatus
  dueDate: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface TaskCreateRequest {
  title: string
  description: string | null
  priority: TaskPriority | null
  dueDate: string | null
}

export interface TaskUpdateRequest {
  title: string
  description: string | null
  priority: TaskPriority | null
  dueDate: string | null
}
