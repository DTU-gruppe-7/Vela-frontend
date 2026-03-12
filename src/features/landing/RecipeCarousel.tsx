import { useState, useEffect } from 'react';
import RecipeCard from '../../components/ui/RecipeCard';
import type {RecipeSummary } from '../../types/Recipe'

interface Props {
    recipes: RecipeSummary[];
}

export const RecipeCarousel = ({ recipes }: Props) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (recipes.length <= 1) return; 

        const intervalId = window.setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === recipes.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000);

        return () => window.clearInterval(intervalId);
        }, [recipes.length]);

        if (recipes.length === 0) {
            return <div>Indlæser opskrifter...</div>
        }
        const currentRecipe = recipes[currentIndex];

        return (
            <div className="w-full h-full">
                <RecipeCard recipe={currentRecipe} />
            </div>
        )
    };
    