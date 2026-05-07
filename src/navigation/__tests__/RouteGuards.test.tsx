import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Shared mock state object
const mockAuthState = {
    isAuthenticated: false,
    isHydrating: false,
};

vi.mock('../../stores/authStore', () => ({
    useAuthStore: vi.fn((selector: (s: typeof mockAuthState) => unknown) => selector(mockAuthState)),
}));

// Ensure the mocked authStore.ts extension is also covered
vi.mock('../../stores/authStore.ts', () => ({
    useAuthStore: vi.fn((selector: (s: typeof mockAuthState) => unknown) => selector(mockAuthState)),
}));

import ProtectedRoute from '../ProtectedRoute';
import GuestRoute from '../GuestRoute';

function renderWithRouter(element: React.ReactElement, initialRoute: string) {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            {element}
        </MemoryRouter>
    );
}

describe('ProtectedRoute', () => {
    beforeEach(() => {
        mockAuthState.isAuthenticated = false;
        mockAuthState.isHydrating = false;
    });

    it('redirects to /login when not authenticated', () => {
        renderWithRouter(
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                </Route>
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>,
            '/dashboard'
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('renders children when authenticated', () => {
        mockAuthState.isAuthenticated = true;

        renderWithRouter(
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                </Route>
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>,
            '/dashboard'
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders nothing while hydrating', () => {
        mockAuthState.isHydrating = true;

        const { container } = renderWithRouter(
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                </Route>
            </Routes>,
            '/dashboard'
        );

        expect(container.innerHTML).toBe('');
    });
});

describe('GuestRoute', () => {
    beforeEach(() => {
        mockAuthState.isAuthenticated = false;
        mockAuthState.isHydrating = false;
    });

    it('renders children when not authenticated', () => {
        renderWithRouter(
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<div>Login Page</div>} />
                </Route>
                <Route path="/" element={<div>Home</div>} />
            </Routes>,
            '/login'
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects to / when authenticated', () => {
        mockAuthState.isAuthenticated = true;

        renderWithRouter(
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<div>Login Page</div>} />
                </Route>
                <Route path="/" element={<div>Home</div>} />
            </Routes>,
            '/login'
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('renders nothing while hydrating', () => {
        mockAuthState.isHydrating = true;

        const { container } = renderWithRouter(
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<div>Login Page</div>} />
                </Route>
            </Routes>,
            '/login'
        );

        expect(container.innerHTML).toBe('');
    });
});
