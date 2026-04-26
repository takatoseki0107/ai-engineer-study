import axios from 'axios'
import type { TaskResponse, TaskStatus, TaskCreateRequest, TaskUpdateRequest } from '../types/task'

const api = axios.create({ baseURL: '/api' })

export async function fetchAllTasks(): Promise<TaskResponse[]> {
  const res = await api.get<TaskResponse[]>('/tasks')
  return res.data
}

export async function fetchTasksByStatus(status: TaskStatus): Promise<TaskResponse[]> {
  const res = await api.get<TaskResponse[]>(`/tasks/status/${status}`)
  return res.data
}

export async function createTask(req: TaskCreateRequest): Promise<TaskResponse> {
  const res = await api.post<TaskResponse>('/tasks', req)
  return res.data
}

export async function updateTask(id: number, req: TaskUpdateRequest): Promise<TaskResponse> {
  const res = await api.put<TaskResponse>(`/tasks/${id}`, req)
  return res.data
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<TaskResponse> {
  const res = await api.patch<TaskResponse>(`/tasks/${id}/status`, { status })
  return res.data
}

export async function updateTaskPosition(id: number, position: number): Promise<TaskResponse> {
  const res = await api.patch<TaskResponse>(`/tasks/${id}/position`, { position })
  return res.data
}
