import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import SnippetCard from '../components/SnippetCard';

const MySnippets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSnippets = async (pageNum = 1) => {
    try {
      const response = await api.get('/snippets/my', {
        params: {
          page: pageNum,
          limit: 10
        }
      });
      
      if (pageNum === 1) {
        setSnippets(response.data.snippets);
      } else {
        setSnippets(prev => [...prev, ...response.data.snippets]);
      }
      
      setHasMore(response.data.snippets.length === 10);
    } catch (error) {
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSnippets(nextPage);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(prev => prev.filter(snippet => snippet._id !== id));
      toast.success('Snippet deleted successfully');
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  if (loading && snippets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Snippets</h1>
        <button
          onClick={() => navigate('/create')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Snippet
        </button>
      </div>

      {snippets.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            You haven't created any snippets yet
          </h2>
          <p className="text-gray-500 mb-8">
            Start by creating your first code snippet!
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Snippet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snippets.map(snippet => (
            <SnippetCard
              key={snippet._id}
              snippet={snippet}
              onDelete={() => handleDelete(snippet._id)}
              showActions
            />
          ))}
        </div>
      )}

      {hasMore && snippets.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MySnippets; 