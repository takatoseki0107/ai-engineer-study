import axios from 'axios'
import type { TaskResponse, TaskStatus } from '../types/task'

const api = axios.create({ baseURL: '/api' })

export async function fetchAllTasks(): Promise<TaskResponse[]> {
  const res = await api.get<TaskResponse[]>('/tasks')
  return res.data
}

export async function fetchTasksByStatus(status: TaskStatus): Promise<TaskResponse[]> {
  const res = await api.get<TaskResponse[]>(`/tasks/status/${status}`)
  return res.data
}
