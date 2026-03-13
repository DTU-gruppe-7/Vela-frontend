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
        <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <div className="w-2/3 max-w-6xl p-6 space-y-6 lg:overflow-y-auto">
  {/* Welcome Section */}
  <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 p-8 shadow-lg">
    {/* Decorative blobs */}
    <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-300/30 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-rose-300/25 blur-2xl" />

    <div className="relative">
      <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-orange-700">
        Velkommen til Vela
      </p>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        Udforsk opskrifter som hele din gruppe kan lide!
      </h1>

      <p className="mt-3 max-w-2xl text-sm text-slate-700 sm:text-base">
        Swipe, match, og planlæg måltider sammen.
      </p>

    </div>
  </section>

  {/* Carousel Section */}
  <section>
    {loading && <p>Indlæser opskrifter...</p>}
    {error && <p className="text-red-500">{error}</p>}
    {!loading && !error && <RecipeCarousel recipes={recipes} />}
  </section>
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