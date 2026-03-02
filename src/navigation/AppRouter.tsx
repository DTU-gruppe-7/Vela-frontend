import { Routes, Route, Navigate } from 'react-router-dom'
import SwipePage from '../features/swipe/SwipePage'
import GroupPage from '../features/groups/GroupPage'
import ProfilePage from '../features/profile/ProfilePage'
import RecipePage from '../features/recipes/RecipePage'
import ShoppingListPage from '../features/shopping/ShoppingListPage'


function AppRouter() {
    return (
        <Routes>
            <Route path="/swipe" element={<SwipePage />} />
            <Route path="/groups" element={<GroupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/recipes" element={<RecipePage />} />
            <Route path="/shoppinglist" element={<ShoppingListPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default AppRouter;