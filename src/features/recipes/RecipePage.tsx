import { useState, useEffect, useMemo, useRef } from 'react';
import { recipeApi } from '../../api/recipeApi';
import type { RecipeSummary } from '../../types/Recipe';
import { FiChevronDown, FiChevronUp, FiSearch, FiSliders } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import RecipeCard from '../../components/ui/RecipeCard';

function RecipePage() {
    const [allRecipes, setAllRecipes] = useState<RecipeSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const pageSizeOptions = [10, 20, 50, 100];

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Alle');
    const [activeKeyword, setActiveKeyword] = useState('Alle');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [showKeywordDropdown, setShowKeywordDropdown] = useState(false);
    const [expandCategories, setExpandCategories] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Luk dropdown ved klik udenfor
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowKeywordDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Hent ALLE opskrifter én gang
    useEffect(() => {
        fetchAllRecipes();
    }, []);

    const fetchAllRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await recipeApi.getAllRecipes();
            setAllRecipes(data);
        } catch (err) {
            setError('Kunne ikke hente opskrifter. Prøv igen senere.');
            console.error('Error fetching recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const toggleFavorite = (id: string) => {
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Kategorier fra ALLE opskrifter
    const categories = useMemo(() => {
        const cats = new Set(allRecipes.map((r) => r.category).filter(Boolean));
        return ['Alle', ...Array.from(cats)];
    }, [allRecipes]);

    // Keywords fra ALLE opskrifter
    const allKeywords = useMemo(() => {
        const kws = new Set<string>();
        allRecipes.forEach((r) => {
            if (r.keywordsJson) {
                try {
                    const parsed: string[] = JSON.parse(r.keywordsJson);
                    parsed.forEach((k) => kws.add(k));
                } catch { /* ignore */ }
            }
        });
        return ['Alle', ...Array.from(kws).sort()];
    }, [allRecipes]);

    // Filtrering på tværs af ALLE opskrifter
    const filteredRecipes = useMemo(() => {
        return allRecipes.filter((recipe) => {
            const matchesSearch =
                !searchQuery ||
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                activeCategory === 'Alle' || recipe.category === activeCategory;
            const matchesKeyword =
                activeKeyword === 'Alle' ||
                (recipe.keywordsJson &&
                    (JSON.parse(recipe.keywordsJson) as string[]).includes(activeKeyword));
            const matchesFavorites = !showFavoritesOnly || favoriteIds.has(recipe.id);
            return matchesSearch && matchesCategory && matchesKeyword && matchesFavorites;
        });
    }, [allRecipes, searchQuery, activeCategory, activeKeyword, showFavoritesOnly, favoriteIds]);

    // Client-side pagination
    const totalCount = filteredRecipes.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    // Nulstil side når filtre ændres
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeCategory, activeKeyword, showFavoritesOnly, pageSize]);

    const paginatedRecipes = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRecipes.slice(start, start + pageSize);
    }, [filteredRecipes, currentPage, pageSize]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Skeleton loading cards
    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-56 bg-gray-200" />
            <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-orange-50/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Title */}
                <h1 className="text-3xl font-semibold text-gray-900 mb-8">
                    Opskrift Bibliotek
                </h1>

                {/* Search bar + filter button */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Søg opskrifter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition shadow-sm"
                        />
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowKeywordDropdown((v) => !v)}
                            className={`flex items-center justify-center w-12 h-12 border rounded-xl transition shadow-sm ${
                                activeKeyword !== 'Alle'
                                    ? 'bg-orange-50 border-orange-400 text-orange-600'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-orange-600'
                            }`}
                        >
                            <FiSliders className="text-lg" />
                        </button>

                        {showKeywordDropdown && (
                            <div className="absolute right-0 top-14 z-50 w-64 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                                <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Keywords</p>
                                {allKeywords.map((kw) => (
                                    <button
                                        key={kw}
                                        onClick={() => {
                                            setActiveKeyword(kw);
                                            setShowKeywordDropdown(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                                            activeKeyword === kw
                                                ? 'bg-orange-100 text-orange-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {kw}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Category tags + favorites toggle */}
                <div className="relative mb-4">
                    <div
                        className={`flex items-center gap-2 flex-wrap overflow-hidden transition-all duration-300 ${
                            expandCategories ? 'max-h-[500px]' : 'max-h-[42px]'
                        }`}
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap ${
                                    activeCategory === cat
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}

                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap ${
                                showFavoritesOnly
                                    ? 'bg-red-50 text-red-500 border-red-300'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-400'
                            }`}
                        >
                            {showFavoritesOnly ? (
                                <FaHeart className="text-red-500" />
                            ) : (
                                <FaRegHeart />
                            )}
                            Favoritter
                        </button>
                    </div>

                    {categories.length > 6 && (
                        <button
                            onClick={() => setExpandCategories((v) => !v)}
                            className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition"
                        >
                            {expandCategories ? (
                                <><FiChevronUp className="text-sm" /> Vis færre</>
                            ) : (
                                <><FiChevronDown className="text-sm" /> Vis alle kategorier</>
                            )}
                        </button>
                    )}
                </div>

                {/* Page size selector + Liked Recipes button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Vis</span>
                        {pageSizeOptions.map((size) => (
                            <button
                                key={size}
                                onClick={() => handlePageSizeChange(size)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                                    pageSize === size
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                        <span className="text-sm text-gray-500">per side</span>
                    </div>
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border transition ${
                            showFavoritesOnly
                                ? 'bg-red-50 text-red-500 border-red-300'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'
                        }`}
                    >
                        {showFavoritesOnly ? (
                            <FaHeart className="text-red-500" />
                        ) : (
                            <FaRegHeart />
                        )}
                        Likede opskrifter
                    </button>
                </div>

                {/* Error state */}
                {error && (
                    <div className="text-center py-10">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchAllRecipes}
                            className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                        >
                            Prøv igen
                        </button>
                    </div>
                )}

                {/* Recipe grid */}
                {!error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                  <SkeletonCard key={i} />
                              ))
                            : paginatedRecipes.map((recipe) => (
                                  <RecipeCard
                                      key={recipe.id}
                                      recipe={recipe}
                                      isFavorite={favoriteIds.has(recipe.id)}
                                      onToggleFavorite={toggleFavorite}
                                      onCategoryClick={setActiveCategory}
                                      onKeywordClick={setActiveKeyword}
                                  />
                              ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredRecipes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FiSearch className="text-5xl mb-4" />
                        <p className="text-lg font-medium">Ingen opskrifter fundet</p>
                        <p className="text-sm mt-1">
                            Prøv at ændre din søgning eller filtre
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-10">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-5 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            Forrige
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                    (p) =>
                                        p === 1 ||
                                        p === totalPages ||
                                        Math.abs(p - currentPage) <= 1
                                )
                                .reduce<(number | string)[]>((acc, p, i, arr) => {
                                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                                        acc.push('...');
                                    }
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((item, i) =>
                                    typeof item === 'string' ? (
                                        <span key={`dots-${i}`} className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => { setCurrentPage(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`w-10 h-10 text-sm font-medium rounded-xl transition ${
                                                currentPage === item
                                                    ? 'bg-orange-500 text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )}
                        </div>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            Næste
                        </button>
                    </div>
                )}

                {/* Total count */}
                {!loading && !error && (
                    <p className="text-center text-sm text-gray-400 mt-4">
                        Viser {paginatedRecipes.length} af {totalCount} opskrifter
                        {(searchQuery || activeCategory !== 'Alle' || activeKeyword !== 'Alle' || showFavoritesOnly) &&
                            ` (${allRecipes.length} total)`}
                    </p>
                )}
            </div>
        </div>
    );
}

export default RecipePage;