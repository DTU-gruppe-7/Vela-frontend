// src/features/auth/RegisterPage.tsx
import { type FormEvent, useState } from 'react';
import velaLogo from '../../../assets/vela-logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import FormField from "../../../components/ui/FormField.tsx";

// Returnér dagens dato som YYYY-MM-DD (bruges til max-dato)
function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

interface FieldErrors {
    confirmPassword?: string;
    dateOfBirth?: string;
}

function RegisterPage() {
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const validate = (): boolean => {
        const errors: FieldErrors = {};

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Adgangskoderne er ikke ens';
        }

        if (!dateOfBirth) {
            errors.dateOfBirth = 'Fødselsdato er påkrævet';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validate()) return;

        try {
            await register({ email, password, firstName, lastName, dateOfBirth });
            navigate('/swipe', { replace: true });
        } catch {
            setError('Kunne ikke oprette konto. Prøv igen.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md p-8">
                {/* Header */}
                <div className="flex flex-col items-center gap-2 mb-8">
                    <img src={velaLogo} alt="Vela" className="h-10 w-10" />
                    <h1 className="text-2xl font-bold text-slate-900">Opret konto</h1>
                    <p className="text-sm text-slate-500">Kom i gang med Vela</p>
                </div>

                {/* API-fejl */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            id="firstName"
                            label="Fornavn"
                            type="text"
                            placeholder="Anders"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            autoComplete="given-name"
                        />
                        <FormField
                            id="lastName"
                            label="Efternavn"
                            type="text"
                            placeholder="Andersen"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                    </div>

                    <FormField
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="din@email.dk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <FormField
                        id="dateOfBirth"
                        label="Fødselsdato"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={todayISO()}
                        required
                        error={fieldErrors.dateOfBirth}
                        autoComplete="bday"
                    />

                    <FormField
                        id="password"
                        label="Adgangskode"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                    />

                    <FormField
                        id="confirmPassword"
                        label="Bekræft adgangskode"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        error={fieldErrors.confirmPassword}
                        autoComplete="new-password"
                    />

                    <Button type="submit" disabled={isLoading} className="mt-2 w-full">
                        {isLoading ? 'Opretter konto…' : 'Opret konto'}
                    </Button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-slate-500">
                    Har du allerede en konto?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Log ind
                    </Link>
                </p>
            </Card>
        </div>
    );
}

export default RegisterPage;