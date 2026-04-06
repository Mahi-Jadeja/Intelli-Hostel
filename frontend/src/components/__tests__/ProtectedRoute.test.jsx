import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// We need to mock the AuthContext
// "Mocking" means creating a fake version of a module
// so we can control what it returns in tests
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  // vi.fn() creates a mock function
  // We'll configure what it returns in each test
}));

import ProtectedRoute from '../shared/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Helper to render with Router (ProtectedRoute uses useLocation)
const renderWithRouter = (ui) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
  // MemoryRouter is a router that doesn't touch the browser's URL
  // Perfect for testing — we simulate navigation without a real browser
};

describe('ProtectedRoute', () => {
  it('should show loading spinner when auth is loading', () => {
    // Configure mock: auth is still loading
    useAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading text, NOT the protected content
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // screen.getByText → throws if not found (asserts it exists)
    // screen.queryByText → returns null if not found (asserts it doesn't exist)
  });

  it('should render children when authenticated with correct role', () => {
    useAuth.mockReturnValue({
      user: { id: '123', name: 'Test', role: 'student' },
      loading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should NOT render children when not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should NOT show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should NOT render children when role does not match', () => {
    useAuth.mockReturnValue({
      user: { id: '123', name: 'Test', role: 'student' },
      loading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Only Content</div>
      </ProtectedRoute>
    );

    // Student should NOT see admin content
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
  });
});