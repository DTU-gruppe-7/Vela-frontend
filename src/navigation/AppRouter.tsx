// src/navigation/AppRouter.tsx
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Guards
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

const MainLayout = lazy(() => import('../components/layout/MainLayout'));
const LandingPage = lazy(() =>
    import('../features/landing/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const HomePage = lazy(() =>
    import('../features/home/pages/HomePage').then((module) => ({ default: module.HomePage })),
);
const SwipePage = lazy(() => import('../features/swipe/pages/SwipePage'));
const GroupPage = lazy(() => import('../features/groups/pages/GroupPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));
const RecipePage = lazy(() => import('../features/recipes/pages/RecipePage'));
const ShoppingListPage = lazy(() => import('../features/shoppingList/pages/ShoppingListPage'));
const MealPlanPage = lazy(() => import('../features/mealplan/pages/MealPlanPage'));
const GroupDetailLayout = lazy(() => import('../features/groups/layouts/GroupDetailLayout'));
const MembersPage = lazy(() => import('../features/groups/pages/MembersPage'));
const RecipeDetailPage = lazy(() => import('../features/recipes/pages/RecipeDetailPage'));
const GroupManagePage = lazy(() => import('../features/groups/pages/GroupManagePage'));
const GroupMatchPage = lazy(() => import('../features/groups/pages/GroupMatchPage'));


function AppRouter() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-orange-50/40 text-gray-500">
                    Indlaeser...
                </div>
            }
        >
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
        </Suspense>
    )
}

export default AppRouter;