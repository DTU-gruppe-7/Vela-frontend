import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupApi} from "../../api/groupApi";
import { recipeApi } from "../../api/recipeApi";
import type { RecipeSummary } from "../../types/Recipe";
import { FiLoader, FiSearch } from 'react-icons/fi';
import { useLikedRecipes } from '../mealplan/hooks/useLikedRecipes';
import RecipeCard from "../../components/ui/RecipeCard";

const GroupMatchPage: React.FC = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [matchedRecipes, setMatchedRecipes] = useState<RecipeSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { likedRecipes } = useLikedRecipes();
    const favoriteIds = new Set(likedRecipes.map((r) => r.id));
    const [error, setError] = useState<string | null>(null);

    

    useEffect(() => {
        const fetchMatches = async () => {
            if (!groupId) {
                return;
            }
            try {
                setIsLoading(true);
                const matches = await groupApi.getMatches(groupId);

                if (!matches || matches.length === 0) {
                    setMatchedRecipes([]);
                    return;
                }
                const matchRecipeIds = new Set(matches.map((m) => m.recipeId));
                const allRecipes = await recipeApi.getAllRecipes();
                const groupMatchedRecipes = allRecipes.filter((recipe) => matchRecipeIds.has(recipe.id));
                setMatchedRecipes(groupMatchedRecipes);
            } catch (err) {
                console.error("Fejl ved hentning af gruppens matches:", err);
                setError("Kunne ikke hente de fælles opskrifter. Prøv igen senere.");
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchMatches();
    }, [groupId]);

    if (isLoading) {
        return (
             <div className="flex justify-center items-center h-64 text-orange-500">
                <FiLoader className="animate-spin text-4xl" />¨
                <p className="ml-4 text-lg">Henter fælles opskrifter...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 font-medium">{error}</div>
        );
    }

    return (
         <div className="p-6 md:p-10 xl:p-14">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Fælles Matches</h2>
            
            {/* Hvis der er 0 matches, vis en flot "Tomt"-tilstand */}
            {matchedRecipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <FiSearch className="text-5xl mb-4" />
                    <p className="text-lg font-medium">Ingen fælles opskrifter endnu</p>
                    <p className="text-sm mt-1">Start med at swipe og like opskrifter i gruppen!</p>
                </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Hver opskrift rendes ud i genbrugs-kortet (RecipeCard) */}
                    {matchedRecipes.map((recipe) => (
                        <div 
                            key={recipe.id} 
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                            className="cursor-pointer"
                        >
                            <RecipeCard
                                recipe={recipe}
                                isFavorite={favoriteIds.has(recipe.id)}
                                // Sub-page: Vi beholder "blanke" tomme funktioner til filtrering
                                onCategoryClick={() => {}}
                                onKeywordClick={() => {}}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupMatchPage;

