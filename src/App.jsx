import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import { debugLog } from './utils/DevConsole';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Memoized Protected Route component
const ProtectedRoute = React.memo(({ children }) => {
  const { user, loading } = useAuth();
  
  debugLog('ProtectedRoute', 'Checking auth state', {
    hasUser: !!user,
    loading,
    path: window.location.pathname
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    debugLog('ProtectedRoute', 'Access denied, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  debugLog('ProtectedRoute', 'Access granted');
  return children;
});

// Memoized Public Route component
const PublicRoute = React.memo(({ children }) => {
  const { user, loading } = useAuth();
  
  debugLog('PublicRoute', 'Checking auth state', {
    hasUser: !!user,
    loading,
    path: window.location.pathname
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    debugLog('PublicRoute', 'User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  debugLog('PublicRoute', 'Access granted', { path: window.location.pathname });
  return children;
});

function App() {
  debugLog('App', 'Rendering');
  
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default React.memo(App);
