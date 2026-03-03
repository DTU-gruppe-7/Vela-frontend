import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ALL_ALLERGENS, ALLERGEN_LABELS, type Allergen } from '../../types/User';
import { authApi } from '../../api/authApi';

interface AllergiesDialogProps {
  isOpen: boolean;
  currentAllergens: Allergen[];
  onClose: () => void;
  onSave: (allergens: Allergen[]) => void;
}

export function AllergiesDialog({
  isOpen,
  currentAllergens,
  onClose,
  onSave,
}: AllergiesDialogProps) {
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>(currentAllergens);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAllergens(currentAllergens);
    setError(null);
  }, [currentAllergens, isOpen]);

  const toggleAllergen = (allergen: Allergen) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await authApi.updateAllergens(selectedAllergens);
      onSave(selectedAllergens);
      // Close dialog after successful save
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (err) {
      console.error('Fejl ved gemning af allergier:', err);
      setError('Kunne ikke gemme allergier. Prøv igen.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Mine allergier</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Luk"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <p className="text-sm text-slate-600 mb-4">
            Vælg de allergier du har:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {ALL_ALLERGENS.map((allergen) => (
              <label
                key={allergen}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAllergens.includes(allergen)}
                  onChange={() => toggleAllergen(allergen)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <span className="text-sm text-slate-700">
                  {ALLERGEN_LABELS[allergen]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Annuller
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Gemmer...' : 'Gem'}
          </button>
        </div>
      </div>
    </div>
  );
}
