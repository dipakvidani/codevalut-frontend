import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import SnippetCard from "../components/SnippetCard";
import SnippetForm from "../components/SnippetForm";
import ErrorBoundary from "../utils/ErrorBoundary";
import ApiTest from '../components/ApiTest';

// Custom fallback for snippet list errors
const snippetErrorFallback = (error, errorInfo) => (
        <div className="text-red-500 p-4 border border-red-500 rounded">
    <h2 className="text-xl font-bold mb-2">Error Loading Snippets</h2>
          <details className="whitespace-pre-wrap">
            <summary>Error details</summary>
      {error && error.toString()}
            <br />
      {errorInfo && errorInfo.componentStack}
          </details>
        </div>
      );

export default function Home() {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchSnippets = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);
      const res = await api.get("/snippets", {
        params: {
          page: pageNum,
          limit: 10
        }
      });
      
      if (!res.data || !Array.isArray(res.data.snippets)) {
        throw new Error("Invalid response structure from API");
      }

      const totalPages = res.data.totalPages || 1;
      setHasMore(pageNum < totalPages);
      setSnippets(prev => append ? [...prev, ...res.data.snippets] : res.data.snippets);
    } catch (err) {
      console.error("Failed to fetch snippets:", err);
      setError("Failed to load snippets. Please try again later.");
      setSnippets([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      if (!isLoading && !isLoadingMore && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchSnippets(nextPage, true);
      }
    }
  }, [isLoading, isLoadingMore, hasMore, page, fetchSnippets]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleCreateSnippet = async (snippetData) => {
    try {
      const res = await api.post("/snippets", snippetData);
      setSnippets(prev => [res.data.snippet, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create snippet:", err);
      setError("Failed to create snippet. Please try again.");
    }
  };

  const handleUpdateSnippet = async (snippetData) => {
    try {
      const res = await api.put(`/snippets/${snippetData._id}`, snippetData);
      setSnippets(prev => 
        prev.map(s => s._id === snippetData._id ? res.data.snippet : s)
      );
      setEditingSnippet(null);
    } catch (err) {
      console.error("Failed to update snippet:", err);
      setError("Failed to update snippet. Please try again.");
    }
  };

  const handleDeleteSnippet = async (snippetId) => {
    try {
      await api.delete(`/snippets/${snippetId}`);
      setSnippets(prev => prev.filter(s => s._id !== snippetId));
    } catch (err) {
      console.error("Failed to delete snippet:", err);
      setError("Failed to delete snippet. Please try again.");
    }
  };

  const filteredSnippets = snippets.filter(snippet => {
    if (filter === 'all') return true;
    if (filter === 'public') return snippet.isPublic;
    if (filter === 'private') return !snippet.isPublic;
    return true;
  });

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to CodeVault</h1>
      
      {/* API Connection Test */}
      <div className="mb-8">
        <ApiTest />
      </div>

    <div className="max-w-4xl mx-auto mt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Snippets</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Snippets</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'New Snippet'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <SnippetForm
            onSubmit={handleCreateSnippet}
            initialData={editingSnippet}
          />
        </div>
      )}

        <ErrorBoundary fallback={snippetErrorFallback}>
        {filteredSnippets.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No snippets found.</p>
        ) : (
          <>
            <div className="space-y-4">
              {filteredSnippets.map((snippet) => (
                <ErrorBoundary key={snippet._id}>
                  <SnippetCard
                    snippet={snippet}
                    onEdit={() => setEditingSnippet(snippet)}
                    onDelete={handleDeleteSnippet}
                  />
                </ErrorBoundary>
              ))}
            </div>
            {isLoadingMore && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            {!hasMore && snippets.length > 0 && (
              <div className="text-center mt-8 text-gray-500">
                No more snippets to load
              </div>
            )}
          </>
        )}
      </ErrorBoundary>
      </div>
    </div>
  );
}
