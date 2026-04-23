import { useState } from 'react';
import type { Task, Status } from '../types/task';
import DeleteDialog from './DeleteDialog';

type Props = {
  mode: 'create' | 'edit';
  task?: Task;
  defaultStatus?: Status;
  onSave: (data: {
    title: string;
    description: string;
    priority: string;
    status: Status;
    due_date: string;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
};

export default function TaskModal({ mode, task, defaultStatus = 'todo', onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? '');
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus);
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('タイトルは必須です');
      return;
    }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description, priority, status, due_date: dueDate });
      onClose();
    } catch {
      // エラーはuseTasks側で管理
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete();
    onClose();
  };

  if (showDeleteDialog) {
    return (
      <DeleteDialog
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {mode === 'create' ? 'タスクを作成' : 'タスクを編集'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="タスクのタイトルを入力"
            />
            {titleError && <p className="text-red-500 text-xs mt-1">{titleError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={3}
              placeholder="説明を入力（任意）"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">未設定</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="todo">未着手</option>
                <option value="in_progress">作業中</option>
                <option value="done">完了</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <div>
            {mode === 'edit' && onDelete && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 text-sm text-red-500 border border-red-300 rounded hover:bg-red-50 cursor-pointer"
              >
                削除
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
