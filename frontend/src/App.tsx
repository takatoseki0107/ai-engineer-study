import { useEffect, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { TaskResponse, TaskFilter } from './types/task'
import { fetchAllTasks, fetchTasksByStatus } from './api/taskApi'
import { useAuth } from './contexts/AuthContext'
import FilterBar from './components/FilterBar'
import Board from './components/Board'
import TaskForm from './components/TaskForm'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function BoardPage() {
  const { username, logout } = useAuth()
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<TaskFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadTasks = useCallback(() => {
    setLoading(true)
    setError(null)
    const request =
      selectedStatus === 'all'
        ? fetchAllTasks()
        : fetchTasksByStatus(selectedStatus)
    request
      .then(setTasks)
      .catch(() => setError('タスクの取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [selectedStatus])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleCreated = () => {
    setShowForm(false)
    loadTasks()
  }

  const handleUpdated = (updated: TaskResponse) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const handleReordered = (reordered: TaskResponse[]) => {
    setTasks(reordered)
  }

  const handleDeleted = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{username}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <FilterBar selected={selectedStatus} onChange={setSelectedStatus} />
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {showForm ? '閉じる' : '+ 新規タスク'}
          </button>
        </div>

        {showForm && (
          <TaskForm
            onClose={() => setShowForm(false)}
            onCreated={handleCreated}
          />
        )}

        {loading && (
          <p className="text-sm text-gray-500">読み込み中...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <Board
            tasks={tasks}
            onUpdated={handleUpdated}
            onReordered={handleReordered}
            onDeleted={handleDeleted}
          />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
