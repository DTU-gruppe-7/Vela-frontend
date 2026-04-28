import { Navigate, Route, Routes } from 'react-router-dom';
import AuthBootstrap from '../components/AuthBootstrap';
import GuestRoute from '../navigation/GuestRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { RecipeDetailPage } from '../features/recipes/pages/RecipeDetailPage';
import type { SsrInitialData } from '../types/ssr';

interface SsrAppProps {
    initialData?: SsrInitialData;
}

export default function SsrApp({ initialData }: SsrAppProps) {
    return (
        <>
            <AuthBootstrap />
            <Routes>
                <Route path="/landing" element={<LandingPage initialRecipes={initialData?.landingRecipes} showAuthPanel={false} />} />

                <Route element={<GuestRoute />}>
                    <Route element={<LandingPage initialRecipes={initialData?.landingRecipes} />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>
                </Route>

                <Route path="/recipes/:id" element={<RecipeDetailPage initialRecipe={initialData?.recipe} />} />

                <Route path="*" element={<Navigate to="/landing" replace />} />
            </Routes>
        </>
    );
}