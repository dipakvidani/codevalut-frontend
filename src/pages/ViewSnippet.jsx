import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import CodePreview from '../components/CodePreview';

const ViewSnippet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snippet, setSnippet] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await api.get(`/snippets/${id}`);
        setSnippet(response.data);
        setIsOwner(response.data.isOwner);
      } catch (error) {
        toast.error('Failed to load snippet');
        navigate('/public');
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      await api.delete(`/snippets/${id}`);
      toast.success('Snippet deleted successfully');
      navigate('/my-snippets');
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Snippet Not Found</h2>
          <button
            onClick={() => navigate('/public')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Public Snippets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{snippet.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Created by {snippet.owner?.username || 'Anonymous'}
            </p>
          </div>
          {isOwner && (
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(`/edit/${id}`)}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        {snippet.description && (
          <p className="text-gray-700 mb-6">{snippet.description}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {snippet.language}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(snippet.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <CodePreview
            code={snippet.code}
            language={snippet.language}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewSnippet; 