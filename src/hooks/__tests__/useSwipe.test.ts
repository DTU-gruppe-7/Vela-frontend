import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSwipe } from '../useSwipe';

describe('useSwipe', () => {
    it('triggers onSwipeLeft for left swipe', () => {
        const onSwipeLeft = vi.fn();
        const onSwipeRight = vi.fn();
        const { result } = renderHook(() =>
            useSwipe({ onSwipeLeft, onSwipeRight, threshold: 50 })
        );

        // Simulate touch sequence: swipe from right to left (300 → 100)
        act(() => {
            result.current.onTouchStart({
                targetTouches: [{ clientX: 300 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchMove({
                targetTouches: [{ clientX: 100 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchEnd();
        });

        expect(onSwipeLeft).toHaveBeenCalledOnce();
        expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it('triggers onSwipeRight for right swipe', () => {
        const onSwipeLeft = vi.fn();
        const onSwipeRight = vi.fn();
        const { result } = renderHook(() =>
            useSwipe({ onSwipeLeft, onSwipeRight, threshold: 50 })
        );

        // Simulate touch sequence: swipe from left to right (100 → 300)
        act(() => {
            result.current.onTouchStart({
                targetTouches: [{ clientX: 100 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchMove({
                targetTouches: [{ clientX: 300 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchEnd();
        });

        expect(onSwipeRight).toHaveBeenCalledOnce();
        expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('does not trigger any callback when below threshold', () => {
        const onSwipeLeft = vi.fn();
        const onSwipeRight = vi.fn();
        const { result } = renderHook(() =>
            useSwipe({ onSwipeLeft, onSwipeRight, threshold: 50 })
        );

        // Swipe distance = 30px (below threshold of 50)
        act(() => {
            result.current.onTouchStart({
                targetTouches: [{ clientX: 200 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchMove({
                targetTouches: [{ clientX: 170 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchEnd();
        });

        expect(onSwipeLeft).not.toHaveBeenCalled();
        expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it('respects custom threshold', () => {
        const onSwipeLeft = vi.fn();
        const { result } = renderHook(() =>
            useSwipe({ onSwipeLeft, threshold: 100 })
        );

        // Swipe distance = 80px (below custom threshold of 100)
        act(() => {
            result.current.onTouchStart({
                targetTouches: [{ clientX: 200 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchMove({
                targetTouches: [{ clientX: 120 }],
            } as unknown as React.TouchEvent);
        });
        act(() => {
            result.current.onTouchEnd();
        });

        expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('does nothing when touchEnd called without touchStart', () => {
        const onSwipeLeft = vi.fn();
        const { result } = renderHook(() =>
            useSwipe({ onSwipeLeft })
        );

        act(() => {
            result.current.onTouchEnd();
        });

        expect(onSwipeLeft).not.toHaveBeenCalled();
    });
});
