import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/private-route";
import PublicSnippets from "./pages/PublicSnippets";
import SavedSnippets from "./pages/SavedSnippets";

// App error boundary component using hooks
function AppErrorBoundary({ children }) {
  const [errorState, setErrorState] = useState({ 
    hasError: false, 
    error: null, 
    errorInfo: null 
  });

  if (errorState.hasError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <div className="bg-gray-50 p-4 rounded">
            <details className="whitespace-pre-wrap">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Error Details
              </summary>
              <div className="mt-2 text-sm">
                <p className="font-semibold">Error:</p>
                <p className="text-red-600">{errorState.error?.toString()}</p>
                <p className="font-semibold mt-2">Component Stack:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {errorState.errorInfo?.componentStack}
                </pre>
              </div>
            </details>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  const routes = [
    { path: "/", element: <Home /> },
    { path: "/register", element: <Register /> },
    { path: "/login", element: <Login /> },
    { path: "/public-snippets", element: <PublicSnippets /> },
    { path: "/saved-snippets", element: <SavedSnippets /> },
    {
      path: "/profile",
      element: (
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      ),
    },
    { path: "*", element: <NotFound /> },
  ];

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
