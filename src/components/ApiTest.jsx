import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ApiTest = () => {
  const [tests, setTests] = useState({
    health: { status: 'pending', data: null, error: null },
    auth: { status: 'pending', data: null, error: null }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      setIsLoading(true);
      
      // Test health endpoint
      try {
        const healthResponse = await api.get('/health');
        setTests(prev => ({
          ...prev,
          health: {
            status: 'success',
            data: healthResponse.data,
            error: null
          }
        }));
      } catch (err) {
        setTests(prev => ({
          ...prev,
          health: {
            status: 'error',
            data: null,
            error: err.message
          }
        }));
      }

      // Test auth endpoint
      try {
        const authResponse = await api.get('/auth/status');
        setTests(prev => ({
          ...prev,
          auth: {
            status: 'success',
            data: authResponse.data,
            error: null
          }
        }));
      } catch (err) {
        setTests(prev => ({
          ...prev,
          auth: {
            status: 'error',
            data: null,
            error: err.message
          }
        }));
      }

      setIsLoading(false);
    };

    runTests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">API Connection Diagnostics</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Running tests...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Health Check Test */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Health Check</h3>
            <p className={`font-medium ${getStatusColor(tests.health.status)}`}>
              Status: {tests.health.status.toUpperCase()}
            </p>
            {tests.health.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">{tests.health.error}</p>
              </div>
            )}
            {tests.health.data && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(tests.health.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Auth Status Test */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Auth Status</h3>
            <p className={`font-medium ${getStatusColor(tests.auth.status)}`}>
              Status: {tests.auth.status.toUpperCase()}
            </p>
            {tests.auth.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">{tests.auth.error}</p>
              </div>
            )}
            {tests.auth.data && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(tests.auth.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Environment Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Environment Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">API URL:</span> {import.meta.env.VITE_API_BASE_URL}</p>
              <p><span className="font-medium">Environment:</span> {import.meta.env.MODE}</p>
              <p><span className="font-medium">API Version:</span> {import.meta.env.VITE_API_VERSION}</p>
              <p><span className="font-medium">Timeout:</span> {import.meta.env.VITE_API_TIMEOUT}ms</p>
            </div>
          </div>

          {/* Retry Button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry Tests
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiTest; 