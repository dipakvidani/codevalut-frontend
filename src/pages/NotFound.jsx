import React from 'react';
import { Link } from 'react-router-dom';
import { debugLog } from '../utils/DevConsole';

const NotFound = () => {
  debugLog('NotFound', 'Page not found accessed');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h1>
      <p className="text-2xl font-semibold mt-4 mb-8 text-gray-800 dark:text-gray-200">
        Page Not Found
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
