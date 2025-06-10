import React, { useState, useEffect } from "react";
import { getSavedSnippetsFromLocalStorage, removeSnippetFromLocalStorage } from "../utils/localStorageService";
import SnippetCard from "../components/SnippetCard";

export default function SavedSnippets() {
  const [savedSnippets, setSavedSnippets] = useState([]);

  useEffect(() => {
    setSavedSnippets(getSavedSnippetsFromLocalStorage());
  }, []);

  const handleUnsave = (snippetId) => {
    removeSnippetFromLocalStorage(snippetId);
    setSavedSnippets(getSavedSnippetsFromLocalStorage()); // Refresh the list
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Saved Snippets</h1>
      {savedSnippets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">You haven't saved any snippets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSnippets.map((snippet) => (
            <SnippetCard 
              key={snippet._id} 
              snippet={snippet} 
              onDelete={handleUnsave} // Using onDelete prop for unsave functionality
              onEdit={null} // Disable edit for saved snippets on this page
            />
          ))}
        </div>
      )}
    </div>
  );
} 