interface AddRecipeButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Knap til at tilføje en opskrift til en dag i madplanen.
 */
export function AddRecipeButton({ onClick, className = '' }: AddRecipeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors text-2xl font-light ${className}`}
    >
      +
    </button>
  );
}
