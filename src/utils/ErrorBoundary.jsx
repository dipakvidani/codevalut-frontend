import React from 'react';

// Debug logger function
const debugLog = (component, action, data = {}) => {
  if (import.meta.env.DEV) {
    console.log(`[${component}] ${action}`, data);
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    debugLog('ErrorBoundary', 'Initialized', { props });
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    debugLog('ErrorBoundary', 'Caught error', { error, errorInfo });
  }

  render() {
    debugLog('ErrorBoundary', 'Rendering children', {});
    
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Error Details</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 