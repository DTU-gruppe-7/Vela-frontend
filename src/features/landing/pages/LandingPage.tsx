import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { recipeApi } from '../../../api/recipeApi'
import type { RecipeSummary } from '../../../types/Recipe'
import { RecipeCarousel } from '../widgets/RecipeCarousel'
import { Guide } from '../widgets/GuideComponent'

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
                <div className="hide-scrollbar w-full lg:w-2/3 lg:overflow-y-auto px-8 sm:px-12 py-14 space-y-14">

                    {/* Hero */}
                    <section>
                        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-emerald-700">Vela</span>
                        <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                            Udforsk opskrifter<br />
                            som hele din gruppe<br />
                            kan lide
                        </h1>
                        <p className="mt-5 text-slate-500 text-base max-w-sm leading-relaxed">
                            Swipe, match og planlæg måltider — sammen.
                        </p>
                    </section>

                    {/* How it works */}
                    <Guide />

                    {/* Populære opskrifter */}
                    <section>
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
