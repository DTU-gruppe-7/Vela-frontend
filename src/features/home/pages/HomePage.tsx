import { useEffect, useState } from 'react'
import { recipeApi } from '../../../api/recipeApi'
import type { RecipeSummary } from '../../../types/Recipe'
import { useNavigate } from 'react-router-dom'
import { MostLikedRecipesWidget } from '../widgets/MostLikedWidget'
import { GroupsWidget } from '../widgets/GroupsWidget'
import { ShoppingListWidget } from '../widgets/ShoppingListWidget'
import { CurrentRecipeWidget } from '../widgets/CurrentRecipeWidget'

export const HomePage = () => {
const [mostLikedRecipes, setMostLikedRecipes] = useState<RecipeSummary[]>([]);
    {/* const [loadingMostLiked, setLoadingMostLiked] = useState(true);
const [mostLikedError, setMostLikedError] = useState<string | null>(null); */}
const navigate = useNavigate();

    useEffect(() => {
        const fetchMostLikedRecipes = async () => {
            try {
                /*setLoadingMostLiked(true);
                setMostLikedError(null);*/
                const data = await recipeApi.getMostLikedRecipes(25);
                setMostLikedRecipes(data);
            } catch {
                /*setMostLikedError('Kunne ikke hente populære opskrifter');*/
            } finally {
                /*setLoadingMostLiked(false);*/
            }
        };

        fetchMostLikedRecipes();
    }, [])

    return(<div className="flex flex-col gap-4 bg-slate-100 p-4">
        <div className="grid flex-1 grid-cols-3 gap-4">
            <GroupsWidget />
            <ShoppingListWidget/>
            <CurrentRecipeWidget/>
        </div>
        <div className="space-y-3">
            <div className="flex items-center justify-center">
                <h2 className="text-xl font-bold text-slate-800">Populære Opskrifter</h2>
            </div>
            <MostLikedRecipesWidget
            recipes={mostLikedRecipes}
            onRecipeClick={(id) => navigate('/recipes/' + id)}
            />
        </div>
    </div>
    )
}