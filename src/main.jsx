import React, { memo, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import { debugLog } from './utils/DevConsole'
import LoadingSpinner from './components/LoadingSpinner'

// Memoized error boundary component for root-level errors
const RootErrorFallback = memo(({ error, resetErrorBoundary }) => {
  debugLog('Root', 'Error boundary caught error', { error })
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error.message}
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={resetErrorBoundary}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
})

// Memoized global error handler
const handleError = memo((error) => {
  debugLog('Global', 'Unhandled error caught', { error })
  // You can add additional error reporting here
})

// Initialize React
debugLog('Main', 'Initializing React')
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

// Render the app with Suspense for code splitting
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter future={{ 
      v7_relativeSplatPath: true,
      v7_startTransition: true 
    }}>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <App />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Add global error handlers in development
if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    handleError(event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason)
  })
}
