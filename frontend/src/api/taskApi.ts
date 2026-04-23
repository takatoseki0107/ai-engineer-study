import axios from 'axios';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '../types/task';

const api = axios.create({ baseURL: '/api' });

export const taskApi = {
  getAll: () => api.get<Task[]>('/tasks'),
  create: (data: TaskCreateRequest) => api.post<Task>('/tasks', data),
  update: (id: number, data: TaskUpdateRequest) => api.patch<Task>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};
