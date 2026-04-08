import { useEffect, useRef } from 'react';
import RecipeCard from '../../../components/ui/RecipeCard';
import type { RecipeSummary } from '../../../types/Recipe'

interface Props{
    recipes: RecipeSummary[];
    onRecipeClick?: (id: string) => void
}

const SCROLL_SPEED = 0.5; // pixels per frame

export const MostLikedRecipesWidget = ({ recipes, onRecipeClick }: Props) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const offsetRef = useRef(0);
    const isPausedRef = useRef(false);

    // Duplicate recipes for seamless looping
    const loopedRecipes = [...recipes, ...recipes];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const clampOffset = (offset: number, halfWidth: number) => {
            let clamped = offset % halfWidth;
            if (clamped < 0) clamped += halfWidth;
            return clamped;
        };

        const step = () => {
            if (!isPausedRef.current && track) {
                const halfWidth = track.scrollWidth / 2;
                offsetRef.current = clampOffset(offsetRef.current + SCROLL_SPEED, halfWidth);
                track.style.transform = `translateX(-${offsetRef.current}px)`;
            }
            animationRef.current = requestAnimationFrame(step);
        };

        const onWheel = (e: WheelEvent) => {
            if (!isPausedRef.current || !track) return;
            e.preventDefault();
            const halfWidth = track.scrollWidth / 2;
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            offsetRef.current = clampOffset(offsetRef.current + delta * 0.5, halfWidth);
            track.style.transform = `translateX(-${offsetRef.current}px)`;
        };

        track.parentElement?.addEventListener('wheel', onWheel, { passive: false });
        animationRef.current = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(animationRef.current);
            track.parentElement?.removeEventListener('wheel', onWheel);
        };
    }, []);

    return (
        <div
            className="w-full overflow-hidden cursor-grab"
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
        >
            <div ref={trackRef} className="flex gap-2" style={{ willChange: 'transform' }}>
                {loopedRecipes.map((recipe, index) => (
                    <div
                        key={`${recipe.id}-${index}`}
                        onClick={() => onRecipeClick?.(recipe.id)}
                        className="w-[calc(20vw-1.5rem)] max-w-xs min-w-40 flex-shrink-0 cursor-pointer"
                    >
                        <RecipeCard recipe={recipe} compact showKeywords={false} showTime={false} showCategory={false} />
                    </div>
                ))}
            </div>
        </div>
    );
};
