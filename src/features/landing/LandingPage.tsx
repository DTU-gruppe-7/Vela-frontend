import { Outlet } from 'react-router-dom'
import { useEffect, useState} from 'react'
import { recipeApi } from '../../api/recipeApi'
import type { RecipeSummary } from '../../types/Recipe'
import { RecipeCarousel } from './RecipeCarousel'

export const LandingPage = () => {

    const [recipes,setRecipes] = useState<RecipeSummary[]>([]);
    const [loading, setloading] = useState(true);
    const [error,setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const data = await recipeApi.getMostLikedRecipes(20);
                setRecipes(data);
            } catch (err) {
                setError('Kunne ikke hente opskrifter');
            } finally {
                setloading(false);
            }
        };

        loadRecipes();
    }, []);

    return (
        <div className="flex min-h-screen">
        {/* Venstre side med opskriftskarrusel */}
        <div className="flex w-2/3 items-center justify-center bg-gray-100">
            <div className="w-full max-w-xl p-6">
                {loading && <p>Indlæser opskrifter...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && <RecipeCarousel recipes={recipes} />}
            </div>
        </div>
        
        {/* Højre side med Auth komponent */}
        <div className="flex w-1/3 items-center justify-center bg-white">
            <div className="w-full max-w-md p-8">
                <Outlet />
            </div>
        </div>
        </div>
    );
};