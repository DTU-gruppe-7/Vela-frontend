import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter from '../CategoryFilter';

const categories = ['Hovedret', 'Forret', 'Dessert', 'Snack'];

describe('CategoryFilter', () => {
    it('renders "Alle" plus all categories', () => {
        render(
            <CategoryFilter categories={categories} activeCategory="Alle" onCategoryChange={vi.fn()} />
        );
        expect(screen.getByText('Alle')).toBeInTheDocument();
        expect(screen.getByText('Hovedret')).toBeInTheDocument();
        expect(screen.getByText('Forret')).toBeInTheDocument();
        expect(screen.getByText('Dessert')).toBeInTheDocument();
        expect(screen.getByText('Snack')).toBeInTheDocument();
    });

    it('hides "Alle" when hideAll is true', () => {
        render(
            <CategoryFilter categories={categories} activeCategory="Hovedret" onCategoryChange={vi.fn()} hideAll={true} />
        );
        expect(screen.queryByText('Alle')).not.toBeInTheDocument();
    });

    it('calls onCategoryChange when a category is clicked', () => {
        const onChange = vi.fn();
        render(
            <CategoryFilter categories={categories} activeCategory="Alle" onCategoryChange={onChange} />
        );
        fireEvent.click(screen.getByText('Dessert'));
        expect(onChange).toHaveBeenCalledWith('Dessert');
    });

    it('highlights active category with orange styling', () => {
        render(
            <CategoryFilter categories={categories} activeCategory="Hovedret" onCategoryChange={vi.fn()} />
        );
        const activeButton = screen.getByText('Hovedret');
        expect(activeButton.className).toContain('bg-orange-500');
    });

    it('inactive categories have white styling', () => {
        render(
            <CategoryFilter categories={categories} activeCategory="Hovedret" onCategoryChange={vi.fn()} />
        );
        const inactiveButton = screen.getByText('Dessert');
        expect(inactiveButton.className).toContain('bg-white');
    });

    it('shows expand button when more than 6 categories', () => {
        const manyCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        render(
            <CategoryFilter categories={manyCategories} activeCategory="Alle" onCategoryChange={vi.fn()} />
        );
        // "Alle" + 7 = 8 > 6, so expand button should appear
        expect(screen.getByText(/Vis alle kategorier/)).toBeInTheDocument();
    });

    it('does not show expand button when 6 or fewer categories', () => {
        render(
            <CategoryFilter categories={categories} activeCategory="Alle" onCategoryChange={vi.fn()} />
        );
        // "Alle" + 4 = 5 ≤ 6
        expect(screen.queryByText(/Vis alle kategorier/)).not.toBeInTheDocument();
    });

    it('toggles expand/collapse on button click', () => {
        const manyCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        render(
            <CategoryFilter categories={manyCategories} activeCategory="Alle" onCategoryChange={vi.fn()} />
        );
        fireEvent.click(screen.getByText(/Vis alle kategorier/));
        expect(screen.getByText(/Vis færre/)).toBeInTheDocument();
    });

    it('renders children slot', () => {
        render(
            <CategoryFilter categories={categories} activeCategory="Alle" onCategoryChange={vi.fn()}>
                <button>Favoritter</button>
            </CategoryFilter>
        );
        expect(screen.getByText('Favoritter')).toBeInTheDocument();
    });
});
