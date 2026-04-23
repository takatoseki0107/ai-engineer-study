export type Priority = 'high' | 'medium' | 'low' | null;
export type Status = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: string;
  status: Status;
  due_date?: string;
  position?: number;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: string | null;
  status?: Status;
  due_date?: string | null;
  position?: number;
}
