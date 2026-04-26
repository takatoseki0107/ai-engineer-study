import { useEffect, useState, useCallback } from 'react'
import type { TaskResponse, TaskStatus } from './types/task'
import { fetchAllTasks, fetchTasksByStatus } from './api/taskApi'
import FilterBar from './components/FilterBar'
import Board from './components/Board'
import TaskForm from './components/TaskForm'

type Filter = TaskStatus | 'all'

export default function App() {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<Filter>('all')
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

  useEffect(() => { loadTasks() }, [loadTasks])

  const handleCreated = () => {
    setShowForm(false)
    loadTasks()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
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

        {!loading && !error && <Board tasks={tasks} />}
      </main>
    </div>
  )
}
