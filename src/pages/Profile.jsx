import React, { useEffect, useState } from "react";
import api from "../services/api";
import SnippetCard from "../components/SnippetCard";
import SnippetForm from "../components/SnippetForm";

export default function Profile() {
  const [snippets, setSnippets] = useState([]);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'

  const fetchSnippets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/snippets/");
      const fetchedData = Array.isArray(res.data.snippets) ? res.data.snippets : [];
      setSnippets(fetchedData);
    } catch (error) {
      console.error("Failed to fetch snippets:", error);
      setError("Failed to load snippets. Please try again later.");
      setSnippets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingSnippet) {
        await api.put(`/snippets/${editingSnippet._id}`, data);
        setEditingSnippet(null);
      } else {
        await api.post("/snippets", data);
      }
      await fetchSnippets();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to save snippet:", error);
      setError("Failed to save snippet. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      await fetchSnippets();
    } catch (error) {
      console.error("Failed to delete snippet:", error);
      setError("Failed to delete snippet. Please try again.");
    }
  };

  const handleEdit = (snippet) => {
    setEditingSnippet(snippet);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingSnippet(null);
    setShowForm(false);
  };

  const handleToggleVisibility = async (snippet) => {
    try {
      const updatedData = {
        ...snippet,
        isPublic: !snippet.isPublic
      };
      await api.put(`/snippets/${snippet._id}`, updatedData);
      await fetchSnippets();
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      setError("Failed to update snippet visibility. Please try again.");
    }
  };

  const filteredSnippets = snippets.filter(snippet => {
    if (filter === 'all') return true;
    if (filter === 'public') return snippet.isPublic;
    if (filter === 'private') return !snippet.isPublic;
    return true;
  });

  if (isLoading) {
    return <div className="text-center mt-8">Loading snippets...</div>;
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
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setShowForm(true);
                setEditingSnippet(null);
              }
            }}
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
            onSubmit={handleCreateOrUpdate}
            initialData={editingSnippet}
          />
        </div>
      )}

      {filteredSnippets.length === 0 ? (
        <p className="text-gray-500 text-center mt-4">No snippets found.</p>
      ) : (
        <div className="space-y-4">
          {filteredSnippets.map((snippet) => (
            <div key={snippet._id} className="relative">
              <SnippetCard
                snippet={snippet}
                onEdit={() => handleEdit(snippet)}
                onDelete={handleDelete}
              />
              <button
                onClick={() => handleToggleVisibility(snippet)}
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  snippet.isPublic
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {snippet.isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
