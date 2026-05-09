import type { AxiosError } from 'axios';

interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

const FIELD_LABELS: Record<string, string> = {
    Email: 'Email',
    Password: 'Adgangskode',
    FirstName: 'Fornavn',
    LastName: 'Efternavn',
    Name: 'Navn',
    Description: 'Beskrivelse',
    DateOfBirth: 'Fødselsdato',
};

export function extractApiError(err: unknown, fallback = 'Noget gik galt. Prøv igen.'): string {
    const data = (err as AxiosError<ApiErrorResponse>)?.response?.data;
    if (!data) return fallback;

    if (data.message) return data.message;

    if (data.errors) {
        const firstField = Object.keys(data.errors)[0];
        if (firstField) {
            const label = FIELD_LABELS[firstField] ?? firstField;
            const firstMessage = data.errors[firstField][0];
            return `${label}: ${firstMessage}`;
        }
    }

    return fallback;
}
