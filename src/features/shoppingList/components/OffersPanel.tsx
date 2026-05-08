import type { ShoppingListGroupOffer } from '../../../types/ShoppingList';

interface OffersPanelProps {
  groups: ShoppingListGroupOffer[];
  selectedStores: Set<string>;
  onToggleStore: (storeName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  filteredTotal: number;
  coveredItemCount: number;
  uncoveredItemCount: number;
}

function OffersPanel({
  groups,
  selectedStores,
  onToggleStore,
  onSelectAll,
  onDeselectAll,
  filteredTotal,
  coveredItemCount,
  uncoveredItemCount,
}: OffersPanelProps) {
  if (groups.length === 0) {
    return null;
  }

  const allStoreNames = Array.from(
    new Set(groups.flatMap((g) => g.offers.map((o) => o.storeName))),
  ).sort();

  if (allStoreNames.length === 0) {
    return null;
  }

  const allSelected = allStoreNames.every((s) => selectedStores.has(s));

  return (
    <section className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-emerald-900">Tilbud</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {coveredItemCount} {coveredItemCount === 1 ? 'vare' : 'varer'} med tilbud
            {uncoveredItemCount > 0 && (
              <span className="text-amber-600"> · {uncoveredItemCount} uden tilbud</span>
            )}
          </p>
        </div>
        {coveredItemCount > 0 && (
          <div className="shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
            {filteredTotal.toFixed(2)} kr
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {allStoreNames.map((storeName) => {
          const checked = selectedStores.has(storeName);
          return (
            <label
              key={storeName}
              className={`flex cursor-pointer select-none items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                checked
                  ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                  : 'border-emerald-200 bg-white text-slate-600 hover:border-emerald-300'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onToggleStore(storeName)}
              />
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                  checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                }`}
              >
                {checked && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {storeName}
            </label>
          );
        })}
      </div>

      <div className="mt-2">
        <button
          type="button"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-emerald-600 underline hover:text-emerald-800"
        >
          {allSelected ? 'Fravælg alle' : 'Vælg alle'}
        </button>
      </div>
    </section>
  );
}

export default OffersPanel;
