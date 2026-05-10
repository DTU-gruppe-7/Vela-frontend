import { memo, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { FaClock, FaHeart, FaRegHeart } from 'react-icons/fa';
import type { RecipeSummary } from '../../types/Recipe';
import { formatDuration } from '../../utils/formatDuration';

interface RecipeCardProps {
    recipe: RecipeSummary;
    isFavorite?: boolean;
    compact?: boolean;
    onClick?: () => void;
    onToggleFavorite?: (id: string) => void;
    onRemove?: () => void;
    onCategoryClick?: (category: string) => void;
    onKeywordClick?: (keyword: string) => void;
    topRightContent?: React.ReactNode;
    showKeywords?: boolean;
    showTime?: boolean;
    showCategory?: boolean;
}

function RecipeCard({
    recipe,
    isFavorite = false,
    compact = false,
    onClick,
    onToggleFavorite,
    onRemove,
    onCategoryClick,
    onKeywordClick,
    topRightContent,
    showKeywords = false,
    showTime = true,
    showCategory = true,
}: RecipeCardProps) {
    const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!onClick) return;

        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            onClick();
        }
    };

    const keywords = useMemo<string[]>(() => {
        if (!recipe.keywordsJson) return [];
        try {
            return JSON.parse(recipe.keywordsJson) as string[];
        } catch {
            return [];
        }
    }, [recipe.keywordsJson]);

    // Check if there's any content to show in the card body
    const hasCardContent = 
        (showCategory && recipe.category) ||
        (showKeywords && keywords.length > 0) ||
        (showTime && (recipe.workTime || recipe.totalTime)) ||
        onToggleFavorite ||
        topRightContent;

    return (
        <div
            onClick={onClick}
            onKeyDown={handleCardKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={onClick ? `Open recipe ${recipe.name}` : undefined}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Image with title overlay */}
            <div className={`relative overflow-hidden ${compact ? 'h-48 sm:h-32' : 'h-56'}`}>
                {recipe.thumbnailUrl ? (
                    <img
                        src={recipe.thumbnailUrl}
                        alt={recipe.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-white text-5xl">
                        🍽️
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <h3 className={`absolute left-4 right-4 font-bold text-white drop-shadow-md ${compact ? 'bottom-2 text-sm' : 'bottom-4 text-lg'}`}>
                    {recipe.name}
                </h3>
                {onRemove && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Card body - only render if there's content to show */}
            {hasCardContent && (
            <div className={compact ? 'p-2 space-y-1' : 'p-4 space-y-3'}>
                {/* Category & favorite */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showCategory && recipe.category && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onCategoryClick?.(recipe.category); }}
                                className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full hover:bg-orange-200 transition"
                            >
                                {recipe.category}
                            </button>
                        )}
                    </div>
                    {topRightContent}
                    {onToggleFavorite && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe.id); }}
                            className="text-xl transition-transform duration-200 hover:scale-110"
                        >
                            {isFavorite ? (
                                <FaHeart className="text-red-400" />
                            ) : (
                                <FaRegHeart className="text-gray-300 hover:text-red-300" />
                            )}
                        </button>
                    )}
                </div>

                {/* Keywords */}
                {showKeywords && keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {keywords.map((kw) => (
                            <button
                                type="button"
                                key={kw}
                                onClick={(e) => { e.stopPropagation(); onKeywordClick?.(kw); }}
                                className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                            >
                                {kw}
                            </button>
                        ))}
                    </div>
                )}

                {/* Time info */}
                {showTime && (recipe.workTime || recipe.totalTime) && (
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        {recipe.workTime && (
                            <span className="flex items-center gap-1">
                                <FaClock className="text-orange-400" />
                                Arbejdstid: {formatDuration(recipe.workTime)}
                            </span>
                        )}
                        {recipe.totalTime && (
                            <span className="flex items-center gap-1">
                                <FaClock className="text-orange-400" />
                                Total: {formatDuration(recipe.totalTime)}
                            </span>
                        )}
                    </div>
                )}
            </div>
            )}
        </div>
    );
}

export default memo(RecipeCard);
