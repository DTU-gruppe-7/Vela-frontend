import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import FormField from "../../../components/ui/FormField.tsx";
import velaLogo from '../../../assets/vela-logo.svg';

function LoginPage() {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Redirect til den side brugeren prøvede at besøge (sat af ProtectedRoute)
    const from = (location.state as { from?: Location })?.from?.pathname || '/swipe';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch {
            setError('Forkert email eller adgangskode');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md p-8">
                {/* Header */}
                <div className="flex flex-col items-center gap-2 mb-8">
                    <img src={velaLogo} alt="Vela" className="h-10 w-10" />
                    <h1 className="text-2xl font-bold text-slate-900">Log ind</h1>
                    <p className="text-sm text-slate-500">Velkommen tilbage til Vela</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        id="password"
                        label="Adgangskode"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    <Button type="submit" disabled={isLoading} className="mt-2 w-full">
                        {isLoading ? 'Logger ind…' : 'Log ind'}
                    </Button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-slate-500">
                    Har du ikke en konto?{' '}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Opret konto
                    </Link>
                </p>
            </Card>
        </div>
    );
}

export default LoginPage;