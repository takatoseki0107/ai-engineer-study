type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteDialog({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">タスクを削除しますか？</h3>
        <p className="text-sm text-gray-500 mb-6">この操作は元に戻せません。</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 cursor-pointer"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
