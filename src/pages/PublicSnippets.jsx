import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import SnippetCard from "../components/SnippetCard";

export default function PublicSnippets() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPublicSnippets = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await api.get("/snippets/public", {
        params: {
          page: pageNum,
          limit: 10
        }
      });

      const newSnippets = response.data.snippets || [];
      const totalPages = response.data.totalPages || 1;

      setHasMore(pageNum < totalPages);
      setSnippets(prev => append ? [...prev, ...newSnippets] : newSnippets);
      setError(null);
    } catch (err) {
      console.error("Error fetching public snippets:", err);
      setError(err.response?.data?.message || "Failed to fetch public snippets");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicSnippets();
  }, [fetchPublicSnippets]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      if (!loading && !isLoadingMore && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPublicSnippets(nextPage, true);
      }
    }
  }, [loading, isLoadingMore, hasMore, page, fetchPublicSnippets]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Public Code Snippets</h1>
      {snippets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No public snippets available yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet._id} snippet={snippet} />
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
    </div>
  );
} 