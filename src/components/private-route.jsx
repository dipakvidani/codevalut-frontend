import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const auth = useContext(AuthContext);
  
  // Handle case where AuthContext is not available
  if (!auth) {
    console.error("AuthContext is not available in PrivateRoute");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 p-4 border border-red-500 rounded">
          Authentication Error: Context not available
        </div>
      </div>
    );
  }

  const { isAuthenticated, isLoading } = auth;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default PrivateRoute;
