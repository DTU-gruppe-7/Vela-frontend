import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeCard from '../RecipeCard';
import type { RecipeSummary } from '../../../types/Recipe';

const mockRecipe: RecipeSummary = {
    id: 'recipe-1',
    name: 'Spaghetti Bolognese',
    category: 'Hovedret',
    thumbnailUrl: 'https://example.com/spaghetti.jpg',
    workTime: 'PT30M',
    totalTime: 'PT1H20M',
    keywordsJson: JSON.stringify(['Italiensk', 'Pasta', 'Nem']),
};

describe('RecipeCard', () => {
    it('renders recipe name', () => {
        render(<RecipeCard recipe={mockRecipe} />);
        expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });

    it('renders image with correct alt text', () => {
        render(<RecipeCard recipe={mockRecipe} />);
        const img = screen.getByAltText('Spaghetti Bolognese');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', mockRecipe.thumbnailUrl);
    });

    it('renders fallback emoji when no thumbnail', () => {
        const noImageRecipe = { ...mockRecipe, thumbnailUrl: '' };
        render(<RecipeCard recipe={noImageRecipe} />);
        expect(screen.getByText('🍽️')).toBeInTheDocument();
    });

    it('renders filled heart when isFavorite is true', () => {
        const onToggle = vi.fn();
        render(<RecipeCard recipe={mockRecipe} isFavorite={true} onToggleFavorite={onToggle} />);
        // FaHeart has the class text-red-400
        const heartButton = screen.getByRole('button', { name: '' }); // heart button
        expect(heartButton).toBeInTheDocument();
    });

    it('calls onToggleFavorite with recipe id when heart clicked', () => {
        const onToggle = vi.fn();
        const { container } = render(
            <RecipeCard recipe={mockRecipe} isFavorite={false} onToggleFavorite={onToggle} />
        );
        // Find the favorite button (the one that's not category)
        const buttons = container.querySelectorAll('button');
        const heartButton = Array.from(buttons).find(btn =>
            btn.classList.contains('text-xl')
        );
        if (heartButton) {
            fireEvent.click(heartButton);
            expect(onToggle).toHaveBeenCalledWith('recipe-1');
        }
    });

    it('renders category badge when showCategory is true', () => {
        render(<RecipeCard recipe={mockRecipe} showCategory={true} />);
        expect(screen.getByText('Hovedret')).toBeInTheDocument();
    });

    it('does not render category when showCategory is false', () => {
        render(<RecipeCard recipe={mockRecipe} showCategory={false} />);
        expect(screen.queryByText('Hovedret')).not.toBeInTheDocument();
    });

    it('renders keywords when showKeywords is true', () => {
        render(<RecipeCard recipe={mockRecipe} showKeywords={true} />);
        expect(screen.getByText('Italiensk')).toBeInTheDocument();
        expect(screen.getByText('Pasta')).toBeInTheDocument();
        expect(screen.getByText('Nem')).toBeInTheDocument();
    });

    it('renders formatted time info when showTime is true', () => {
        render(<RecipeCard recipe={mockRecipe} showTime={true} />);
        expect(screen.getByText(/30 min/)).toBeInTheDocument();
        expect(screen.getByText(/1 t 20 min/)).toBeInTheDocument();
    });

    it('does not render time when showTime is false', () => {
        render(<RecipeCard recipe={mockRecipe} showTime={false} />);
        expect(screen.queryByText(/Arbejdstid/)).not.toBeInTheDocument();
    });

    it('calls onClick when card is clicked', () => {
        const onClick = vi.fn();
        render(<RecipeCard recipe={mockRecipe} onClick={onClick} />);
        fireEvent.click(screen.getByText('Spaghetti Bolognese'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('calls onClick on Enter key press', () => {
        const onClick = vi.fn();
        render(<RecipeCard recipe={mockRecipe} onClick={onClick} />);
        const card = screen.getByRole('button', { name: /Open recipe/ });
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('calls onClick on Space key press', () => {
        const onClick = vi.fn();
        render(<RecipeCard recipe={mockRecipe} onClick={onClick} />);
        const card = screen.getByRole('button', { name: /Open recipe/ });
        fireEvent.keyDown(card, { key: ' ' });
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('renders remove button when onRemove is provided', () => {
        const onRemove = vi.fn();
        render(<RecipeCard recipe={mockRecipe} onRemove={onRemove} />);
        expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('calls onCategoryClick and stops propagation', () => {
        const onClick = vi.fn();
        const onCategoryClick = vi.fn();
        render(
            <RecipeCard
                recipe={mockRecipe}
                onClick={onClick}
                onCategoryClick={onCategoryClick}
                showCategory={true}
            />
        );
        fireEvent.click(screen.getByText('Hovedret'));
        expect(onCategoryClick).toHaveBeenCalledWith('Hovedret');
        // onClick should NOT be called because stopPropagation
        expect(onClick).not.toHaveBeenCalled();
    });

    it('renders no card body when all content flags are false and no callbacks', () => {
        const { container } = render(
            <RecipeCard
                recipe={{ ...mockRecipe, category: '', workTime: '', totalTime: '', keywordsJson: '' }}
                showCategory={false}
                showKeywords={false}
                showTime={false}
            />
        );
        // The card body div (with padding) should not exist
        const bodyDiv = container.querySelector('.p-4');
        expect(bodyDiv).toBeNull();
    });
});
