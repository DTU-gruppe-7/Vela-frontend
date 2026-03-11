import { FaClock, FaHeart, FaRegHeart } from 'react-icons/fa';
import type { RecipeSummary } from '../../types/Recipe';

/**
 * Parse an ISO 8601 duration string (e.g. "PT1H20M", "PT45M", "PT2H") into a
 * human-readable Danish string like "1 t 20 min" or "45 min".
 */
function formatDuration(iso: string): string {
    const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
    if (!match) return iso;
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} t`);
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.length > 0 ? parts.join(' ') : '0 min';
}

interface RecipeCardProps {
    recipe: RecipeSummary;
    isFavorite?: boolean;
    compact?: boolean;
    onToggleFavorite?: (id: string) => void;
    onRemove?: () => void;
    onCategoryClick?: (category: string) => void;
    onKeywordClick?: (keyword: string) => void;
}

function RecipeCard({
    recipe,
    isFavorite = false,
    compact = false,
    onToggleFavorite,
    onRemove,
    onCategoryClick,
    onKeywordClick,
}: RecipeCardProps) {
    const keywords: string[] = recipe.keywordsJson
        ? JSON.parse(recipe.keywordsJson)
        : [];

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
            {/* Image with title overlay */}
            <div className={`relative overflow-hidden ${compact ? 'h-32' : 'h-56'}`}>
                {recipe.thumbnailUrl ? (
                    <img
                        src={recipe.thumbnailUrl}
                        alt={recipe.name}
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

            {/* Card body */}
            <div className={compact ? 'p-2 space-y-1' : 'p-4 space-y-3'}>
                {/* Category & favorite */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {recipe.category && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onCategoryClick?.(recipe.category); }}
                                className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full hover:bg-orange-200 transition"
                            >
                                {recipe.category}
                            </button>
                        )}
                    </div>
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
                {keywords.length > 0 && (
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
                {(recipe.workTime || recipe.totalTime) && (
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
        </div>
    );
}

export default RecipeCard;
