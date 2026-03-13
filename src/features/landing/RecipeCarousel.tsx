import { useState, useEffect } from 'react';
import RecipeCard from '../../components/ui/RecipeCard';
import type {RecipeSummary } from '../../types/Recipe'

interface Props {
    recipes: RecipeSummary[];
}
const SLOT_COUNT = 12;

export const RecipeCarousel = ({ recipes }: Props) => {
    const [slotIndices, setSlotIndices] = useState<number[]>([]);
    
    //Laver "SLOT_COUNT" synlige pladser i karrusellen
    useEffect(() => {
        if (recipes.length === 0) {
            setSlotIndices([]);
            return;
        }

        const initial = Array.from({ length: SLOT_COUNT }, (_, slot) => slot % recipes.length);
        setSlotIndices(initial);
    }, [recipes]);

    // Hvert plads´ rotation
    useEffect(() => {
        if (recipes.length <= 1) return;

        const timers = Array.from({ length: SLOT_COUNT }, (_, slot) =>{
            const intervalMs = 3000 + slot * 250;

            return window.setInterval(() => {
                setSlotIndices((prev) => {
                    if (prev.length === 0) return prev;
                    const next = [...prev];
                    next[slot] = (next[slot] + 1) % recipes.length;
                    return next;
                });
            }, intervalMs);
        });

        return () => timers.forEach((id) => window.clearInterval(id));
    }, [recipes.length]);

        if (recipes.length === 0) {
            return <div>Ingen opskrifter fundet</div>
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: SLOT_COUNT }, (_, slot) => {
                    const recipe = recipes[slotIndices[slot] ?? (slot% recipes.length)];
                    return (
                        <div key={slot} className="min-h-[260px]">
                            <RecipeCard recipe={recipe} compact/>
                        </div>
                    );
                })}
            </div>
        );
    };