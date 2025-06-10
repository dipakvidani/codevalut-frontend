import React, { useState } from 'react';

function ErrorBoundary({ children, fallback, onError }) {
  const [errorState, setErrorState] = useState({ 
    hasError: false, 
    error: null, 
    errorInfo: null 
  });

  if (errorState.hasError) {
    // If a custom fallback is provided, use it
    if (fallback) {
      return fallback(errorState.error, errorState.errorInfo);
    }

    // Default error UI
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <details className="whitespace-pre-wrap">
          <summary>Error details</summary>
          {errorState.error && errorState.error.toString()}
          <br />
          {errorState.errorInfo && errorState.errorInfo.componentStack}
        </details>
      </div>
    );
  }

  return children;
}

export default ErrorBoundary; 