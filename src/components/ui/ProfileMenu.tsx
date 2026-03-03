import { useState, useEffect } from 'react';
import { FaHeartbeat, FaSignOutAlt } from 'react-icons/fa';
import type { Allergen } from '../../types/User';
import { AllergiesDialog } from './AllergiesDialog';
import { getAllergensFromStorage } from '../../utils/allergenStorage';

interface ProfileMenuProps {
  onClose: () => void;
}

export default function ProfileMenu({ onClose }: ProfileMenuProps) {
  const [showAllergiesDialog, setShowAllergiesDialog] = useState(false);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hent allergener fra localStorage
    const storedAllergens = getAllergensFromStorage();
    setAllergens(storedAllergens);
    setIsLoading(false);
  }, []);

  const handleAllergiesClick = () => {
    setShowAllergiesDialog(true);
  };

  const handleAllergiesSave = (newAllergens: Allergen[]) => {
    setAllergens(newAllergens);
    onClose(); // Close profile menu after saving allergies
  };

  const handleLogout = () => {
    // Redirect til login side
    window.location.href = '/login';
  };

  return (
    <>
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
        {/* Menu Items */}
        <button
          onClick={handleAllergiesClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b border-slate-100"
        >
          <FaHeartbeat className="text-lg" />
          <div>
            <div className="font-medium text-sm">Mine allergier</div>
            {!isLoading && allergens.length > 0 && (
              <div className="text-xs text-slate-500">{allergens.length} valgt</div>
            )}
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-medium text-sm">Log ud</span>
        </button>
      </div>

      {/* Allergies Dialog */}
      <AllergiesDialog
        isOpen={showAllergiesDialog}
        currentAllergens={allergens}
        onClose={() => {
          setShowAllergiesDialog(false);
          onClose();
        }}
        onSave={handleAllergiesSave}
      />
    </>
  );
}
