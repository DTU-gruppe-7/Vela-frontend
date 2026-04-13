import { useState, useEffect, useRef } from 'react';
import RecipeCard from '../../../components/ui/RecipeCard';
import type { RecipeSummary } from '../../../types/Recipe';

interface Props {
    recipes: RecipeSummary[];
}

const SLOT_COUNT = 3;
const TRANSITION_MS = 650;
const PAUSE_MS = 2500;

interface SlotState {
    currentIndex: number;
    nextIndex: number;
    isTransitioning: boolean;
}

export const RecipeCarousel = ({ recipes }: Props) => {
    const [slots, setSlots] = useState<SlotState[]>(() =>
        recipes.length === 0
            ? []
            : Array.from({ length: SLOT_COUNT }, (_, slot) => ({
                  currentIndex: slot % recipes.length,
                  nextIndex: (slot + 1) % recipes.length,
                  isTransitioning: false,
              }))
    );
    const [prevRecipes, setPrevRecipes] = useState(recipes);
    const activeSlotRef = useRef<number>(0);

    if (recipes !== prevRecipes) {
        setPrevRecipes(recipes);
        setSlots(
            recipes.length === 0
                ? []
                : Array.from({ length: SLOT_COUNT }, (_, slot) => ({
                      currentIndex: slot % recipes.length,
                      nextIndex: (slot + 1) % recipes.length,
                      isTransitioning: false,
                  }))
        );
    }

    useEffect(() => {
        if (recipes.length <= 1) return;
        activeSlotRef.current = 0;

        const id = window.setInterval(() => {
            const slot = activeSlotRef.current;

            // Start transition
            setSlots((prev) => {
                if (prev.length === 0 || prev[slot].isTransitioning) return prev;
                const next = [...prev];
                const s = next[slot];
                next[slot] = {
                    ...s,
                    nextIndex: (s.currentIndex + 1) % recipes.length,
                    isTransitioning: true,
                };
                return next;
            });

            // Finish transition
            setTimeout(() => {
                setSlots((prev) => {
                    if (prev.length === 0) return prev;
                    const next = [...prev];
                    const s = next[slot];
                    next[slot] = {
                        currentIndex: s.nextIndex,
                        nextIndex: (s.nextIndex + 1) % recipes.length,
                        isTransitioning: false,
                    };
                    return next;
                });
            }, TRANSITION_MS);

            activeSlotRef.current = (slot + 1) % SLOT_COUNT;
        }, PAUSE_MS);

        return () => window.clearInterval(id);
    }, [recipes.length]);

    if (recipes.length === 0) {
        return <div>Ingen opskrifter fundet</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot, i) => {
                const current = recipes[slot.currentIndex];
                const next = recipes[slot.nextIndex];
                const easing = `cubic-bezier(0.76, 0, 0.24, 1)`;

                return (
                    <div key={i} className="relative min-h-[260px] overflow-hidden">
                        {/* Nuværende kort — glider ud til venstre */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                transform: slot.isTransitioning ? 'translateX(-105%)' : 'translateX(0)',
                                transition: slot.isTransitioning
                                    ? `transform ${TRANSITION_MS}ms ${easing}`
                                    : 'none',
                            }}
                        >
                            <RecipeCard recipe={current} compact />
                        </div>

                        {/* Næste kort — glider ind fra højre */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                transform: slot.isTransitioning ? 'translateX(0)' : 'translateX(105%)',
                                transition: slot.isTransitioning
                                    ? `transform ${TRANSITION_MS}ms ${easing}`
                                    : 'none',
                            }}
                        >
                            <RecipeCard recipe={next} compact />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
