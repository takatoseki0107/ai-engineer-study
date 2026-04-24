import { useEffect, useState } from 'react'
import type { TaskResponse, TaskStatus } from './types/task'
import { fetchAllTasks, fetchTasksByStatus } from './api/taskApi'
import FilterBar from './components/FilterBar'
import Board from './components/Board'

type Filter = TaskStatus | 'all'

export default function App() {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
      </header>

      <main className="p-6 space-y-4">
        <FilterBar selected={selectedStatus} onChange={setSelectedStatus} />

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
