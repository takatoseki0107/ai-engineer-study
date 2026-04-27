import { useState } from 'react'
import type { TaskPriority, TaskCreateRequest } from '../types/task'
import { createTask, getApiErrorMessage } from '../api/taskApi'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function TaskForm({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('タイトルは必須です')
      return
    }
    setSubmitting(true)
    setError(null)
    const req: TaskCreateRequest = {
      title: title.trim(),
      description: description.trim() || null,
      priority: priority || null,
      dueDate: dueDate || null,
    }
    try {
      await createTask(req)
      onCreated()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'タスクの作成に失敗しました'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-md">
      <h2 className="text-sm font-bold text-gray-800 mb-4">新規タスク</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="new-title" className="block text-xs font-medium text-gray-600 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            id="new-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label htmlFor="new-description" className="block text-xs font-medium text-gray-600 mb-1">説明</label>
          <textarea
            id="new-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
        <div>
          <label htmlFor="new-priority" className="block text-xs font-medium text-gray-600 mb-1">優先度</label>
          <select
            id="new-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">未設定</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div>
          <label htmlFor="new-due-date" className="block text-xs font-medium text-gray-600 mb-1">期日</label>
          <input
            id="new-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '保存中...' : '作成'}
          </button>
        </div>
      </form>
    </div>
  )
}
