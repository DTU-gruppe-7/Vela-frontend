import { FiTrash2 } from 'react-icons/fi';

interface ToolbarProps {
  hasCheckedItems: boolean;
  hasItems: boolean;
  onDeleteChecked: () => void;
  onClearAll: () => void;
}

function Toolbar({ hasCheckedItems, hasItems, onDeleteChecked, onClearAll }: ToolbarProps) {
  return (
    <div className="mb-4 flex items-center justify-end px-1">
      <div className="flex items-center gap-2">
        <button
          onClick={onDeleteChecked}
          disabled={!hasCheckedItems}
          className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Slet alle købt varer"
        >
          <FiTrash2 />
          Slet købte
        </button>
        <button
          onClick={onClearAll}
          disabled={!hasItems}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Slet hele indkøbslisten"
        >
          <FiTrash2 />
          Slet alt
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
