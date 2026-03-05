import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
interface CategoryFilterProps {
    categories: string[];          // Uden "Alle" – komponenten tilføjer den selv
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    children?: React.ReactNode;    // Slot til ekstra knapper (f.eks. favorites)
}
function CategoryFilter({
    categories,
    activeCategory,
    onCategoryChange,
    children,
}: CategoryFilterProps) {
    const [expanded, setExpanded] = useState(false);
    const allCategories = ['Alle', ...categories];
    return (
        <div className="relative mb-4">
            <div
                className={`flex items-center gap-2 flex-wrap overflow-hidden transition-all duration-300 ${
                    expanded ? 'max-h-[500px]' : 'max-h-[42px]'
                }`}
            >
                {allCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap ${
                            activeCategory === cat
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
                {children}
            </div>
            {allCategories.length > 6 && (
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition"
                >
                    {expanded ? (
                        <><FiChevronUp className="text-sm" /> Vis færre</>
                    ) : (
                        <><FiChevronDown className="text-sm" /> Vis alle kategorier</>
                    )}
                </button>
            )}
        </div>
    );
}
export default CategoryFilter;