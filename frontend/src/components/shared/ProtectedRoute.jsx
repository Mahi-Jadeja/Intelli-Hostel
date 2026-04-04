import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute - Guards routes based on auth state and role
 *
 * Usage:
 *   <Route path="/admin/*" element={
 *     <ProtectedRoute allowedRoles={['admin']}>
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   } />
 *
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {ReactNode} children - The component to render if authorized
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  // useLocation() gives us the current URL
  // We pass it to the login page so after login, we can redirect back here

  // Still checking auth state — show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {/* Simple loading spinner using Tailwind animation */}
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    // Navigate replaces the current URL with /login
    // state={{ from: location }} saves WHERE the user was trying to go
    // After login, we can redirect them back to this page
    return <Navigate to="/login" state={{ from: location }} replace />;
    // replace: replaces the current history entry instead of adding a new one
    // So pressing "back" after redirect doesn't go to the protected page
  }

  // Authenticated but wrong role — redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Student trying to access admin page → send to student dashboard
    // Admin trying to access student page → send to admin dashboard
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed — render the protected content
  return children;
};

export default ProtectedRoute;