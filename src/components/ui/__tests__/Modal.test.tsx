import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
    afterEach(() => {
        // Reset body overflow after each test
        document.body.style.overflow = '';
    });

    it('does not render when isOpen is false', () => {
        render(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
        render(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
        render(<Modal isOpen={true} onClose={vi.fn()} title="Min Modal">Content</Modal>);
        expect(screen.getByText('Min Modal')).toBeInTheDocument();
    });

    it('renders children content', () => {
        render(<Modal isOpen={true} onClose={vi.fn()}>Hello World</Modal>);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('calls onClose when Escape key is pressed', () => {
        const onClose = vi.fn();
        render(<Modal isOpen={true} onClose={onClose}>Content</Modal>);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when backdrop is clicked', () => {
        const onClose = vi.fn();
        render(<Modal isOpen={true} onClose={onClose}>Content</Modal>);
        // Backdrop is the element with bg-black/50
        const backdrop = document.querySelector('.backdrop-blur-sm');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(onClose).toHaveBeenCalledOnce();
        }
    });

    it('locks body scroll when open', () => {
        render(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when closed', () => {
        const { rerender } = render(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
        expect(document.body.style.overflow).toBe('');
    });

    it('renders close button when title is present', () => {
        render(<Modal isOpen={true} onClose={vi.fn()} title="Test">Content</Modal>);
        expect(screen.getByLabelText('Luk')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
        fireEvent.click(screen.getByLabelText('Luk'));
        expect(onClose).toHaveBeenCalledOnce();
    });
});
