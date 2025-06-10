import React, { Component } from 'react';

// Debug logger function
const debugLog = (component, action, data = {}) => {
  if (import.meta.env.DEV) {
    console.log(`[${component}] ${action}`, data);
  }
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
    debugLog('ErrorBoundary', 'Initialized', { props });
  }

  static getDerivedStateFromError(error) {
    debugLog('ErrorBoundary', 'getDerivedStateFromError', { error });
    return { 
      hasError: true,
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    debugLog('ErrorBoundary', 'componentDidCatch', { error, errorInfo });
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      debugLog('ErrorBoundary', 'Rendering error UI', this.state);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-red-800 font-medium">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="mt-2 text-sm text-red-600 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <button
              onClick={() => {
                debugLog('ErrorBoundary', 'Reload button clicked');
                window.location.reload();
              }}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    debugLog('ErrorBoundary', 'Rendering children');
    return this.props.children;
  }
}

export default ErrorBoundary; 