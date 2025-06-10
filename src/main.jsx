import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ErrorBoundary from './utils/ErrorBoundary.jsx'
import './index.css'

// Enable React development mode and error handling
if (import.meta.env.DEV) {
  console.log("Running in development mode");
  // Enable React error overlay
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
  });
  // Enable React error boundary
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

// Create root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root with error handling
const root = ReactDOM.createRoot(rootElement);

// Custom fallback for root error boundary
const rootErrorFallback = (error, errorInfo) => (
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
            <p className="text-red-600">{error?.toString()}</p>
            <p className="font-semibold mt-2">Component Stack:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {errorInfo?.componentStack}
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

// Render app with error boundary
root.render(
  <ErrorBoundary fallback={rootErrorFallback}>
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  </ErrorBoundary>
);
