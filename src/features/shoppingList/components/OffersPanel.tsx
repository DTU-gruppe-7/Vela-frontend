import { useRef, useState } from 'react';
import type { ShoppingListGroupOffer } from '../../../types/ShoppingList';

interface OffersPanelProps {
  groups: ShoppingListGroupOffer[];
  allStoreNames: string[];
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
  allStoreNames,
  selectedStores,
  onToggleStore,
  onSelectAll,
  onDeselectAll,
  filteredTotal,
  coveredItemCount,
  uncoveredItemCount,
}: OffersPanelProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (groups.length === 0 && allStoreNames.length === 0) {
    return null;
  }

  const allSelected = allStoreNames.every((s) => selectedStores.has(s));
  const selectedCount = allStoreNames.filter((s) => selectedStores.has(s)).length;

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

        <div className="flex shrink-0 items-center gap-2">
          {coveredItemCount > 0 && (
            <div className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
              {filteredTotal.toFixed(2)} kr
            </div>
          )}

          {allStoreNames.length > 0 && (
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  filterOpen
                    ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                    : 'border-emerald-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 3h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1zm2 4h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1zm2 4h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1z" />
                </svg>
                Butikker
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  selectedCount === 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {selectedCount}/{allStoreNames.length}
                </span>
              </button>

              {filterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Filtrer butikker</span>
                      <button
                        type="button"
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        className="text-[11px] text-emerald-600 underline hover:text-emerald-800"
                      >
                        {allSelected ? 'Fravælg alle' : 'Vælg alle'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      {allStoreNames.map((storeName) => {
                        const checked = selectedStores.has(storeName);
                        return (
                          <label
                            key={storeName}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => onToggleStore(storeName)}
                            />
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                checked
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : 'border-slate-300 bg-white'
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
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default OffersPanel;
