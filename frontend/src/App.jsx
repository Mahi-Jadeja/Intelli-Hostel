// BrowserRouter provides the routing context to the entire app
// Routes is a container for Route definitions
// Route maps a URL path to a component
// Navigate redirects to a different URL
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Toast container for notifications
import { Toaster } from 'react-hot-toast';

// Auth context provider (we'll create this next)
import { AuthProvider } from './context/AuthContext';

// Shared components
import ProtectedRoute from './components/shared/ProtectedRoute';
import ErrorBoundary from './components/shared/ErrorBoundary';

// Public pages (we'll create these soon)
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import OAuthCallback from './pages/public/OAuthCallback';

// Error pages
import NotFound from './pages/errors/NotFound';

// Placeholder components for student and admin pages
// We'll replace these with real components in Phase 3+
const StudentDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Student Dashboard</h1><p>Coming in Phase 3...</p></div>;
const AdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p>Coming in Phase 3...</p></div>;

function App() {
  return (
    // ErrorBoundary catches any JavaScript errors in child components
    // and shows a fallback UI instead of crashing the whole app
    <ErrorBoundary>
      {/* BrowserRouter enables URL-based routing */}
      <BrowserRouter>
        {/* AuthProvider gives all components access to auth state */}
        <AuthProvider>

          {/* Toaster renders toast notifications */}
          {/* position: where toasts appear on screen */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Route Definitions */}
          <Routes>
            {/* ================================ */}
            {/* PUBLIC ROUTES */}
            {/* ================================ */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* ================================ */}
            {/* STUDENT ROUTES (protected) */}
            {/* ================================ */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* ================================ */}
            {/* ADMIN ROUTES (protected) */}
            {/* ================================ */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ================================ */}
            {/* CATCH-ALL (404) */}
            {/* ================================ */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;