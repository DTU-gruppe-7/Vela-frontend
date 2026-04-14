import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { recipeApi } from '../../../api/recipeApi'
import type { RecipeSummary } from '../../../types/Recipe'
import { RecipeCarousel } from '../widgets/RecipeCarousel'
import { Guide } from '../widgets/GuideComponent'
import velaLogo from '../../../assets/vela-logo.svg'

export const LandingPage = () => {

    const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const data = await recipeApi.getMostLikedRecipes(3);
                setRecipes(data);
            } catch {
                setError('Kunne ikke hente opskrifter');
            } finally {
                setLoading(false);
            }
        };
        loadRecipes();
    }, []);

    return (
        <>
            <style>{`
                .hide-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div className="flex min-h-screen flex-col-reverse lg:flex-row lg:h-screen lg:overflow-hidden bg-stone-50">

                {/* Venstre side — indhold */}
                <div className="hide-scrollbar w-full lg:w-2/3 lg:overflow-y-auto px-8 sm:px-12 py-14 space-y-8">

                    {/* Logo */}
                    <div className="w-24 sm:w-28">
                        <img src={velaLogo} alt="Vela logo" className="w-full h-auto" />
                    </div>

                    {/* Hero */}
                    <section>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                            Udforsk opskrifter<br />
                            som hele din gruppe<br />
                            kan lide
                        </h1>
                    </section>

                    {/* How it works */}
                    <Guide />

                    {/* Populære opskrifter */}
                    <section className="mt-14">
                        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-5">
                            Populære opskrifter
                        </p>
                        {loading && <p className="text-slate-400 text-sm">Indlæser...</p>}
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        {!loading && !error && <RecipeCarousel recipes={recipes} />}
                    </section>

                </div>

                {/* Højre side — auth */}
                <div className="flex w-full items-start justify-center bg-white border-l border-slate-200 lg:w-1/3 lg:items-center">
                    <div className="w-full p-8 lg:p-10">
                        <Outlet />
                    </div>
                </div>

            </div>
        </>
    );
};
