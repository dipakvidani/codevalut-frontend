import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const auth = useContext(AuthContext);

  // Handle case where AuthContext is not available
  if (!auth) {
    console.error("AuthContext is not available in Navbar");
    return (
      <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          CodeVault
        </Link>
        <div className="text-red-500">Authentication Error</div>
      </nav>
    );
  }

  const { isAuthenticated, user, logout, isLoading } = auth;

  // Render nothing or a simplified loading state during authentication check
  if (isLoading) {
    return (
      <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          CodeVault
        </Link>
        <div className="animate-pulse">Loading...</div>
      </nav>
    );
  }

  // Safely get user display name
  const getUserDisplayName = () => {
    if (!user) return null;
    if (typeof user.name === 'string' && user.name.trim()) return user.name;
    if (typeof user.email === 'string' && user.email.trim()) return user.email;
    return null;
  };

  const userDisplayName = getUserDisplayName();

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        CodeVault
      </Link>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-300">
          Home
        </Link>
        <Link to="/public-snippets" className="hover:text-gray-300">
          Public Snippets
        </Link>
        {isAuthenticated && (
          <Link to="/saved-snippets" className="hover:text-gray-300">
            Saved Snippets
          </Link>
        )}
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="hover:text-gray-300">
              Profile
            </Link>
            {userDisplayName && (
              <span className="text-gray-300">Welcome, {userDisplayName}!</span>
            )}
            <button 
              onClick={logout} 
              className="hover:text-gray-300 bg-red-600 px-3 py-1 rounded transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-gray-300">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
