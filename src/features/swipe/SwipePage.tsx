import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRecipeQueue } from "../../hooks/useRecipeQueue";
import SwipeCard from "./SwipeCard";

function SwipePage() {

    const { queue, swipe, isLoading } = useRecipeQueue();
    const [lastDir, setLastDir] = useState<"like" | "dislike">("like");

    /** Sæt retning før kortet fjernes, så exit-animation ved hvilken vej */
    const handleSwipe = (id: string, dir: "like" | "dislike") => {
        setLastDir(dir);
        swipe(id, dir);
    };

    /* ── Loading state ── */
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Finder lækker mad…</p>
            </div>
        );
    }

    /* ── Empty state ── */
    if (queue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 px-6 text-center">
                <span className="text-5xl">🎉</span>
                <h2 className="text-xl font-bold text-gray-800">Du har set alle retter!</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                    Tjek din profil for at se dine likes – eller kom tilbage senere for nye retter.
                </p>
            </div>
        );
    }

    const currentRecipe = queue[0];

    return (
        <div className="flex flex-col items-center justify-center px-4 pt-4 pb-8 min-h-[80vh] select-none overflow-hidden">
            <div className="relative w-full max-w-[380px] h-[520px]">
                <AnimatePresence mode="popLayout" custom={lastDir}>
                    {queue.slice(0, 3).map((recipe, index) => (
                        <SwipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isTop={index === 0}
                            stackIndex={index}
                            onSwipe={handleSwipe}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-10 mt-10 z-20">
                {/* Dislike – venstre */}
                <button
                    type="button"
                    onClick={() => handleSwipe(currentRecipe.id, 'dislike')}
                    className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-xl shadow-rose-200/50 hover:shadow-2xl hover:shadow-rose-300 hover:-translate-y-1 active:scale-90 transition-all duration-300 transform"
                    aria-label="Dislike"
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                            
                {/* Like – højre */}
                <button
                    type="button"
                    onClick={() => handleSwipe(currentRecipe.id, 'like')}
                    className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-xl shadow-green-200/50 hover:shadow-2xl hover:shadow-green-300 hover:-translate-y-1 active:scale-90 transition-all duration-300 transform"
                    aria-label="Like"
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>

            <p className="mt-4 text-xs text-gray-400">
                Swipe kortet eller brug knapperne
            </p>
        </div>
    );
}

export default SwipePage;