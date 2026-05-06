import { useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import type { StoreOffer } from '../../../types/ShoppingList';

interface OfferPickerModalProps {
  ingredientName: string;
  offers: StoreOffer[];
  selectedOfferId?: string;
  onSelect: (offerId: string) => void;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

function formatPackage(quantity: number, unit: string): string {
  const formatted = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toLocaleString('da-DK', { maximumFractionDigits: 2 });
  return `${formatted} ${unit}`;
}

function OfferPickerModal({ ingredientName, offers, selectedOfferId, onSelect, onClose }: OfferPickerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sorted = [...offers].sort((a, b) => a.price - b.price);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold capitalize text-gray-800">
            Tilbud – {ingredientName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Luk"
          >
            <FiX />
          </button>
        </div>

        <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto p-4">
          {sorted.map((offer, index) => {
            const isSelected = offer.id === selectedOfferId;
            const isCheapest = index === 0;
            const hasPackageInfo =
              offer.packageQuantity != null &&
              offer.packageUnit &&
              !(offer.packageUnit === 'stk' && offer.packageQuantity === 1);

            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => { onSelect(offer.id); onClose(); }}
                className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">{offer.storeName}</span>
                      {isCheapest && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          Billigst
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{offer.productName}</p>
                    {hasPackageInfo && (
                      <p className="text-xs text-gray-400">
                        {formatPackage(offer.packageQuantity!, offer.packageUnit!)}
                        {offer.normalizedUnitPrice != null && (
                          <span> · {offer.normalizedUnitPrice.toFixed(2)} kr/enhed</span>
                        )}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-gray-400">
                      {formatDate(offer.validFrom)} – {formatDate(offer.validTo)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-base font-bold text-gray-900">
                      {offer.price.toFixed(2)} kr
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <FiCheck className="text-xs" /> Valgt
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Vælg</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OfferPickerModal;
