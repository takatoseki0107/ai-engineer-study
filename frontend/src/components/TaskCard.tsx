import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types/task';
import { isOverdue, PRIORITY_LABELS, PRIORITY_STYLES } from '../utils/taskHelpers';

type Props = {
  task: Task;
  onClick: () => void;
};

export default function TaskCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = isOverdue(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
        overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <p className={`text-sm font-medium mb-2 ${overdue ? 'text-red-700' : 'text-gray-800'}`}>
        {task.title}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {task.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        )}
        {task.due_date && (
          <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
            {overdue ? '⚠ ' : ''}{task.due_date}
          </span>
        )}
      </div>
    </div>
  );
}
