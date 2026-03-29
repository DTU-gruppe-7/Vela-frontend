import { Outlet } from 'react-router-dom'
import { useEffect, useState} from 'react'
import { recipeApi } from '../../api/recipeApi'
import type { RecipeSummary } from '../../types/Recipe'
import { RecipeCarousel } from './RecipeCarousel'
import { Guide } from './GuideComponent'

export const LandingPage = () => {

    const [recipes,setRecipes] = useState<RecipeSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const data = await recipeApi.getMostLikedRecipes(20);
                setRecipes(data);
            } catch (err) {
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
        <div className="flex min-h-screen flex-col-reverse lg:flex-row lg:h-screen lg:overflow-hidden">
        <div className="hide-scrollbar w-full lg:w-2/3 max-w-6xl p-6 space-y-6 lg:overflow-y-auto">
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

        {/* How It Works Slideshow */}
      <Guide />

  {/* Carousel Section */}
  <section>
    <h2 className="mb-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
      Mest populære opskrifter
    </h2>
    {loading && <p>Indlæser opskrifter...</p>}
    {error && <p className="text-red-500">{error}</p>}
    {!loading && !error && <RecipeCarousel recipes={recipes} />}
  </section>
</div>
        
        {/* Højre side med Auth komponent */}
        <div className="flex w-full items-start justify-center bg-white lg:w-1/3 lg:items-center">
          <div className="w-full p-8 lg:p-10">
                <Outlet />
            </div>
        </div>
        </div>
        </>
    );
};