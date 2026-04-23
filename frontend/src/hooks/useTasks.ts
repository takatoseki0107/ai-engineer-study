import { useReducer, useCallback } from 'react';
import { taskApi } from '../api/taskApi';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '../types/task';

type State = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_LOADING' }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_ERROR'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload], loading: false };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
        loading: false,
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload), loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function useTasks() {
  const [state, dispatch] = useReducer(reducer, { tasks: [], loading: false, error: null });

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await taskApi.getAll();
      dispatch({ type: 'SET_TASKS', payload: res.data });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'タスクの取得に失敗しました' });
    }
  }, []);

  const createTask = useCallback(async (data: TaskCreateRequest) => {
    try {
      const res = await taskApi.create(data);
      dispatch({ type: 'ADD_TASK', payload: res.data });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'タスクの作成に失敗しました' });
      throw new Error('create failed');
    }
  }, []);

  const updateTask = useCallback(async (id: number, data: TaskUpdateRequest) => {
    try {
      const res = await taskApi.update(id, data);
      dispatch({ type: 'UPDATE_TASK', payload: res.data });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'タスクの更新に失敗しました' });
      throw new Error('update failed');
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await taskApi.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'タスクの削除に失敗しました' });
      throw new Error('delete failed');
    }
  }, []);

  const reorderTasks = useCallback((updatedTasks: Task[]) => {
    dispatch({ type: 'SET_TASKS', payload: updatedTasks });
  }, []);

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
