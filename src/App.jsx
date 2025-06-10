import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { debugLog } from './utils/DevConsole';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route component
const ProtectedRoute = ({ children }) => {
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
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
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
};

function App() {
  debugLog('App', 'Rendering');
  
  return (
    <>
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

export default App;
