// src/navigation/AppRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Guards
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

// Layout
import MainLayout from '../components/layout/MainLayout';

// LandingPage
import { LandingPage } from '../features/landing/pages/LandingPage';

// Auth pages (no header/footer)
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

// App pages (with header/footer)
import { HomePage } from '../features/home/pages/HomePage';
import SwipePage from '../features/swipe/pages/SwipePage';
import GroupPage from '../features/groups/pages/GroupPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import RecipePage from '../features/recipes/pages/RecipePage';
import ShoppingListPage from '../features/shoppingList/pages/ShoppingListPage';
import MealPlanPage from '../features/mealplan/pages/MealPlanPage';
import GroupDetailLayout from '../features/groups/layouts/GroupDetailLayout';
import MembersPage from '../features/groups/pages/MembersPage';
import RecipeDetailPage from '../features/recipes/pages/RecipeDetailPage';
import GroupManagePage from '../features/groups/pages/GroupManagePage';
import GroupMatchPage from '../features/groups/pages/GroupMatchPage';


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
                    <Route path="/groups/:groupId" element={<GroupDetailLayout />}>
                        <Route index element={<Navigate to="mealplan" replace />} />
                        <Route path="mealplan" element={<MealPlanPage />} />
                        <Route path="members" element={<MembersPage />} />
                        <Route path="shoppinglist" element={<ShoppingListPage />} />
                        <Route path="manage" element={<GroupManagePage />} />
                        <Route path="liked-recipes" element={<GroupMatchPage />} />
                    </Route>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/recipes" element={<RecipePage />} />
                    <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                    <Route path="/shoppinglist" element={<ShoppingListPage />} />
                    <Route path="/mealplan" element={<MealPlanPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default AppRouter;