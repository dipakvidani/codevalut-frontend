import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './utils/ErrorBoundary'
import DevConsole from './components/DevConsole'
import './index.css'

// Debug logger function
const debugLog = (component, action, data = {}) => {
  if (import.meta.env.DEV) {
    console.log(`[${component}] ${action}`, data)
  }
}

// Custom fallback UI for root-level errors
const RootErrorFallback = ({ error, resetErrorBoundary }) => {
  debugLog('RootErrorFallback', 'Rendering', { error })
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Application Error
        </h2>
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-800 font-medium">
            {error?.toString()}
          </p>
        </div>
        <button
          onClick={() => {
            debugLog('RootErrorFallback', 'Reset button clicked')
            resetErrorBoundary()
          }}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

// Development mode error handling
if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    debugLog('GlobalError', 'Caught error', {
      error: event.error,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    debugLog('UnhandledRejection', 'Caught promise rejection', {
      reason: event.reason
    })
  })
}

// Create root element
const rootElement = document.getElementById('root')
if (!rootElement) {
  debugLog('Main', 'Root element not found')
  throw new Error('Root element not found')
}

// Initialize React
debugLog('Main', 'Initializing React')
const root = ReactDOM.createRoot(rootElement)

// Render the app
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <DevConsole />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
