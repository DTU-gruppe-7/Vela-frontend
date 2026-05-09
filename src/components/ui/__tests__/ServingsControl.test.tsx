import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServingsControl } from '../ServingsControl';

describe('ServingsControl', () => {
    it('displays the current value', () => {
        render(<ServingsControl value={4} onChange={vi.fn()} />);
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('calls onChange with incremented value on + click', () => {
        const onChange = vi.fn();
        render(<ServingsControl value={4} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Flere personer'));
        expect(onChange).toHaveBeenCalledWith(5);
    });

    it('calls onChange with decremented value on - click', () => {
        const onChange = vi.fn();
        render(<ServingsControl value={4} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Færre personer'));
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it('does not go below min value', () => {
        const onChange = vi.fn();
        render(<ServingsControl value={1} onChange={onChange} min={1} />);
        fireEvent.click(screen.getByLabelText('Færre personer'));
        expect(onChange).toHaveBeenCalledWith(1); // Clamped to min
    });

    it('respects custom min value', () => {
        const onChange = vi.fn();
        render(<ServingsControl value={2} onChange={onChange} min={2} />);
        fireEvent.click(screen.getByLabelText('Færre personer'));
        expect(onChange).toHaveBeenCalledWith(2); // Clamped to min=2
    });

    it('stops event propagation on click', () => {
        const parentClick = vi.fn();
        const onChange = vi.fn();
        render(
            <div onClick={parentClick}>
                <ServingsControl value={4} onChange={onChange} />
            </div>
        );
        fireEvent.click(screen.getByLabelText('Flere personer'));
        expect(parentClick).not.toHaveBeenCalled();
    });
});
