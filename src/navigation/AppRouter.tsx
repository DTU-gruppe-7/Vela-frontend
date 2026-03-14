// src/navigation/AppRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Guards
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

// Layout
import MainLayout from '../components/layout/MainLayout';

// LandingPage
import { LandingPage } from '../features/landing/LandingPage';

// Auth pages (no header/footer)
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// App pages (with header/footer)
import HomePage from '../features/home/HomePage';
import SwipePage from '../features/swipe/SwipePage';
import GroupPage from '../features/groups/GroupPage';
import ProfilePage from '../features/profile/ProfilePage';
import RecipePage from '../features/recipes/RecipePage';
import ShoppingListPage from '../features/shoppingList/ShoppingListPage';
import ShoppingListDetailPage from "../features/shoppingList/ShoppingListDetailPage.tsx";
import MealPlanPage from '../features/mealplan/MealPlanPage';
import RecipeDetailPage from '../features/recipes/RecipeDetailPage';

function AppRouter() {
    return (
        <Routes>
            <Route element={<GuestRoute />}>
                <Route element={<LandingPage />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/swipe" element={<SwipePage />} />
                    <Route path="/groups" element={<GroupPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/recipes" element={<RecipePage />} />
                    <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                    <Route path="/shoppinglist" element={<ShoppingListPage />} />
                        <Route path="/shoppinglist/:id" element={<ShoppingListDetailPage />} />
                    <Route path="/mealplan" element={<MealPlanPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default AppRouter;