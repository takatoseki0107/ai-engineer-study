import type { TaskFilter } from '../types/task'

interface Props {
  selected: TaskFilter
  onChange: (status: TaskFilter) => void
}

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '完了' },
]

export default function FilterBar({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === f.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
