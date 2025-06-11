import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { debugLog } from '../utils/DevConsole';
import LoadingSpinner from '../components/LoadingSpinner';
import SnippetForm from '../components/SnippetForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);

  useEffect(() => {
    debugLog('Dashboard', 'Component mounted', { userId: user?.id });
    fetchSnippets();
  }, [user]);

  const fetchSnippets = async () => {
    try {
      debugLog('Dashboard', 'Fetching snippets');
      setLoading(true);
      setError(null);

      const response = await api.get('/snippets');
      debugLog('Dashboard', 'Raw snippets API response data', response.data); // Log raw data
      
      let fetchedSnippets = [];
      if (Array.isArray(response.data)) {
        fetchedSnippets = response.data;
        debugLog('Dashboard', 'Found snippets directly in response.data (array)', { count: fetchedSnippets.length });
      } else if (response.data && Array.isArray(response.data.snippets)) {
        fetchedSnippets = response.data.snippets;
        debugLog('Dashboard', 'Found snippets in response.data.snippets', { count: fetchedSnippets.length });
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedSnippets = response.data.data;
        debugLog('Dashboard', 'Found snippets in response.data.data', { count: fetchedSnippets.length });
      } else if (response.data && response.data.docs && Array.isArray(response.data.docs)) {
        // Common pattern for paginated responses (e.g., Mongoose paginate)
        fetchedSnippets = response.data.docs;
        debugLog('Dashboard', 'Found snippets in response.data.docs', { count: fetchedSnippets.length });
      } else {
        debugLog('Dashboard', 'Unexpected snippets response structure - falling back to empty array', response.data);
        fetchedSnippets = []; // Fallback to empty array
      }

      debugLog('Dashboard', 'Snippets fetched successfully', {
        count: fetchedSnippets.length,
        responseDataType: typeof response.data,
        fetchedSnippetsType: Array.isArray(fetchedSnippets) ? 'array' : typeof fetchedSnippets
      });
      
      setSnippets(fetchedSnippets);
    } catch (error) {
      debugLog('Dashboard', 'Error fetching snippets', {
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      setError('Failed to load snippets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (snippetData) => {
    try {
      setLoading(true);
      setError(null);

      if (editingSnippet) {
        debugLog('Dashboard', 'Updating snippet', { id: editingSnippet._id, payload: snippetData });
        const response = await api.put(`/snippets/${editingSnippet._id}`, snippetData);
        debugLog('Dashboard', 'Snippet update successful', { response: response.data });
        toast.success('Snippet updated successfully!');
      } else {
        debugLog('Dashboard', 'Creating new snippet', { payload: snippetData });
        const response = await api.post('/snippets', snippetData);
        debugLog('Dashboard', 'Snippet creation successful', { response: response.data });
        toast.success('Snippet created successfully!');
      }

      await fetchSnippets();
      setShowForm(false);
      setEditingSnippet(null);
    } catch (error) {
      debugLog('Dashboard', 'Error saving snippet', {
        error: error.message,
        status: error.response?.status
      });
      setError('Failed to save snippet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      debugLog('Dashboard', 'Deleting snippet', { id });
      setLoading(true);
      await api.delete(`/snippets/${id}`);
      await fetchSnippets();
      toast.success('Snippet deleted successfully!');
    } catch (error) {
      debugLog('Dashboard', 'Error deleting snippet', {
        error: error.message,
        status: error.response?.status
      });
      setError('Failed to delete snippet. Please try again.');
      toast.error('Failed to delete snippet!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (snippet) => {
    debugLog('Dashboard', 'Editing snippet', { id: snippet._id, snippetData: snippet });
    setEditingSnippet(snippet);
    setShowForm(true);
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      debugLog('Dashboard', 'Toggling snippet visibility', {
        id,
        currentVisibility,
        newVisibility: !currentVisibility
      });
      setLoading(true);
      const response = await api.put(`/snippets/${id}`, {
        isPublic: !currentVisibility
      });
      debugLog('Dashboard', 'Snippet visibility toggled successfully', { response: response.data });
      toast.success(`Snippet made ${!currentVisibility ? 'public' : 'private'}!`);
      await fetchSnippets();
    } catch (error) {
      debugLog('Dashboard', 'Error toggling visibility', {
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      setError('Failed to update snippet visibility. Please try again.');
      toast.error('Failed to update snippet visibility.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = useMemo(() => {
    debugLog('Dashboard', 'Filtering snippets', { filter, searchQuery, snippetCount: snippets.length });
    return snippets.filter(snippet => {
      const matchesFilter = filter === 'all' || 
        (filter === 'public' && snippet.isPublic) ||
        (filter === 'private' && !snippet.isPublic);
      
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      const matchesSearch = lowerCaseSearchQuery === '' ||
        snippet.title.toLowerCase().includes(lowerCaseSearchQuery) ||
        snippet.description.toLowerCase().includes(lowerCaseSearchQuery) ||
        (Array.isArray(snippet.tags) && snippet.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchQuery)));

      return matchesFilter && matchesSearch;
    });
  }, [snippets, filter, searchQuery]);

  if (loading && snippets.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Code Snippets</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingSnippet(null);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {showForm ? 'Cancel' : 'New Snippet'}
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-100" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {showForm && (
          <SnippetForm
            onSubmit={handleCreateOrUpdate}
            initialData={editingSnippet}
            onCancel={() => {
              setShowForm(false);
              setEditingSnippet(null);
            }}
          />
        )}

        {snippets.length === 0 && !error && !showForm ? (
          <p className="text-center text-gray-600 dark:text-gray-400">You don't have any snippets yet. Start by creating one!</p>
        ) : (
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
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input px-4 py-2 border rounded-md ml-4 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all" className="text-gray-900 dark:text-white">All Snippets</option>
                <option value="public" className="text-gray-900 dark:text-white">Public</option>
                <option value="private" className="text-gray-900 dark:text-white">Private</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSnippets.map((snippet) => (
                <div key={snippet._id} className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{snippet.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300">Language: {snippet.language}</p>
                  <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto dark:bg-gray-700 dark:text-gray-200">
                    <code>{snippet.code.substring(0, 100)}...</code>
                  </pre>
                  {/* Add more snippet details or actions here */}
                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      onClick={() => handleEdit(snippet)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(snippet._id)}
                      className="text-red-600 hover:text-red-900 font-medium dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(snippet._id, snippet.isPublic)}
                      className="text-gray-600 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {snippet.isPublic ? 'Make Private' : 'Make Public'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 