import React, { useEffect, useState } from "react";
import api from "../services/api";
import SnippetCard from "../components/SnippetCard";
import SnippetForm from "../components/SnippetForm";
import ErrorBoundary from "../utils/ErrorBoundary";

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

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get("/snippets");
        
        if (!res.data || !Array.isArray(res.data.snippets)) {
          throw new Error("Invalid response structure from API");
        }

        setSnippets(res.data.snippets);
      } catch (err) {
        console.error("Failed to fetch snippets:", err);
        setError("Failed to load snippets. Please try again later.");
        setSnippets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippets();
  }, []);

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
        )}
      </ErrorBoundary>
    </div>
  );
}
