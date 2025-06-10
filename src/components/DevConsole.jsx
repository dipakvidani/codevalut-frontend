import React, { useState, useEffect } from 'react';

const DevConsole = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'log', 'error', 'warn'

  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
  };

  // Custom console methods
  const customConsole = {
    log: (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, { type: 'log', message, timestamp: new Date() }]);
      originalConsole.log(...args); // Use original console.log
    },
    error: (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, { type: 'error', message, timestamp: new Date() }]);
      originalConsole.error(...args); // Use original console.error
    },
    warn: (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, { type: 'warn', message, timestamp: new Date() }]);
      originalConsole.warn(...args); // Use original console.warn
    }
  };

  // Override console methods
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log = customConsole.log;
      console.error = customConsole.error;
      console.warn = customConsole.warn;

      // Log initial message
      originalConsole.log('DevConsole initialized');

      return () => {
        // Restore original console methods
        console.log = originalConsole.log;
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
      };
    }
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.type === filter
  );

  const getLogColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-red-600';
      case 'warn':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="max-h-64 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-2 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('log')}
              className={`px-2 py-1 rounded ${filter === 'log' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Log
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 rounded ${filter === 'error' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Error
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-2 py-1 rounded ${filter === 'warn' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              Warn
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearLogs}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Clear
            </button>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              {isVisible ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="p-2 font-mono text-sm">
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`py-1 ${getLogColor(log.type)}`}
            >
              <span className="text-gray-400">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className="mx-2">|</span>
              <span className="font-semibold">{log.type.toUpperCase()}:</span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevConsole; 