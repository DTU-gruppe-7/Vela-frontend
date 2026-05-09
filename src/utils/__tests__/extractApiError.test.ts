import { describe, it, expect } from 'vitest';
import { extractApiError } from '../extractApiError';

describe('extractApiError', () => {
    it('returns message from response data', () => {
        const error = {
            response: { data: { message: 'Ugyldig email' } },
        };
        expect(extractApiError(error)).toBe('Ugyldig email');
    });

    it('returns formatted field error with Danish label', () => {
        const error = {
            response: {
                data: {
                    errors: {
                        Email: ['Email er påkrævet'],
                    },
                },
            },
        };
        expect(extractApiError(error)).toBe('Email: Email er påkrævet');
    });

    it('returns formatted field error with Password label', () => {
        const error = {
            response: {
                data: {
                    errors: {
                        Password: ['Mindst 8 tegn'],
                    },
                },
            },
        };
        expect(extractApiError(error)).toBe('Adgangskode: Mindst 8 tegn');
    });

    it('uses raw field name when no label mapping exists', () => {
        const error = {
            response: {
                data: {
                    errors: {
                        UnknownField: ['Noget fejlede'],
                    },
                },
            },
        };
        expect(extractApiError(error)).toBe('UnknownField: Noget fejlede');
    });

    it('returns fallback when no response data', () => {
        expect(extractApiError({})).toBe('Noget gik galt. Prøv igen.');
    });

    it('returns fallback for null input', () => {
        expect(extractApiError(null)).toBe('Noget gik galt. Prøv igen.');
    });

    it('returns custom fallback message', () => {
        expect(extractApiError(null, 'Custom fejl')).toBe('Custom fejl');
    });

    it('prefers message over errors', () => {
        const error = {
            response: {
                data: {
                    message: 'Server fejl',
                    errors: { Email: ['Email er påkrævet'] },
                },
            },
        };
        expect(extractApiError(error)).toBe('Server fejl');
    });
});
