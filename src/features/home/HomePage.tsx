import { useEffect, useState } from 'react'
import { recipeApi } from '../../api/recipeApi'
import type { RecipeSummary } from '../../types/Recipe'
import {useNavigate} from 'react-router-dom'
import { MostLikedRecipesWidget } from './MostLikedWidget'

const Placeholder = ({label }: { label: string}) => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-400">
        <span className="text-sm font-medium">{label}</span>
    </div>
)

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
            {/*three panels goes in here*/}
            <Placeholder label="Første spot"/>
            <Placeholder label="Andet Spot"/>
            <Placeholder label="Tredje spot"/>
        </div>
        <div className="">
            {/*bottom panel goes in here*/}
            <MostLikedRecipesWidget
            recipes={mostLikedRecipes}
            onRecipeClick={(id) => navigate('/recipes/$' + {id})}
            />
        </div>
    </div>
    )
}