import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { debugLog } from '../utils/DevConsole';
import LoadingSpinner from '../components/LoadingSpinner';

const PublicSnippets = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');

  useEffect(() => {
    fetchPublicSnippets();
  }, []);

  const fetchPublicSnippets = async () => {
    try {
      debugLog('PublicSnippets', 'Fetching public snippets');
        setLoading(true);
      setError(null);
      
      const response = await api.get('/snippets/public');
      debugLog('PublicSnippets', 'Public snippets response', response.data);
      
      setSnippets(response.data.snippets || []);
    } catch (error) {
      debugLog('PublicSnippets', 'Error fetching public snippets', {
        error: error.message,
        status: error.response?.status
      });
      setError('Failed to load public snippets. Please try again.');
      toast.error('Failed to load public snippets');
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = searchQuery === '' ||
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (snippet.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage = languageFilter === 'all' || snippet.language.toLowerCase() === languageFilter.toLowerCase();

    return matchesSearch && matchesLanguage;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Public Code Snippets</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="input px-4 py-2 border rounded-md ml-4 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all" className="text-gray-900 dark:text-white">All Languages</option>
              <option value="javascript" className="text-gray-900 dark:text-white">JavaScript</option>
              <option value="python" className="text-gray-900 dark:text-white">Python</option>
              <option value="java" className="text-gray-900 dark:text-white">Java</option>
              <option value="cpp" className="text-gray-900 dark:text-white">C++</option>
              <option value="csharp" className="text-gray-900 dark:text-white">C#</option>
              <option value="php" className="text-gray-900 dark:text-white">PHP</option>
              <option value="ruby" className="text-gray-900 dark:text-white">Ruby</option>
              <option value="swift" className="text-gray-900 dark:text-white">Swift</option>
              <option value="go" className="text-gray-900 dark:text-white">Go</option>
            </select>
          </div>

          {filteredSnippets.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">No public snippets found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSnippets.map((snippet) => (
                <div key={snippet._id} className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{snippet.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300">Language: {snippet.language}</p>
                  {snippet.user && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      By: {snippet.user.name || snippet.user.email}
                    </p>
                  )}
                  <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto dark:bg-gray-700 dark:text-gray-200">
                    <code>{snippet.code.substring(0, 100)}...</code>
                  </pre>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(snippet.tags || []).map(tag => (
                      <span key={tag} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-200">
                        {tag}
                      </span>
                    ))}
            </div>
                  {snippet.updatedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Last Updated: {new Date(snippet.updatedAt).toLocaleDateString()} at {new Date(snippet.updatedAt).toLocaleTimeString()}
                    </p>
          )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSnippets; 