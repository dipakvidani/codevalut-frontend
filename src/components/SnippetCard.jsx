import React, { lazy, Suspense, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { toast } from 'react-toastify';
import { isSnippetSaved, saveSnippetToLocalStorage, removeSnippetFromLocalStorage } from "../utils/localStorageService";

// Lazy load code preview component
const CodePreview = lazy(() => import('./CodePreview'));

// Loading fallback for code preview
const CodePreviewFallback = React.memo(() => (
  <div className="bg-gray-50 p-4 rounded text-sm overflow-auto border border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
));

const SnippetCard = React.memo(({ snippet, onEdit, onDelete }) => {
  const [isSaved, setIsSaved] = React.useState(isSnippetSaved(snippet._id));
  const [showPreview, setShowPreview] = React.useState(false);

  // Strict type checking
  if (!snippet || typeof snippet !== 'object') {
    console.error("Invalid snippet provided to SnippetCard:", snippet);
    return null;
  }

  // Required fields check
  if (!snippet._id) {
    console.error("Snippet missing required _id field:", snippet);
    return null;
  }

  // Memoize computed values
  const { title, code, language, isPublic, lastUpdated, userName } = useMemo(() => ({
    title: typeof snippet.title === 'string' ? snippet.title : 'Untitled Snippet',
    code: typeof snippet.code === 'string' ? snippet.code : '',
    language: typeof snippet.language === 'string' ? snippet.language : 'JavaScript',
    isPublic: Boolean(snippet.isPublic),
    lastUpdated: snippet.updatedAt 
      ? new Date(snippet.updatedAt).toLocaleString() 
      : 'N/A',
    userName: (() => {
      if (snippet.user) {
        if (typeof snippet.user === 'object' && snippet.user.name) {
          return snippet.user.name;
        } else if (typeof snippet.user === 'string') {
          return snippet.user;
        }
      }
      return '';
    })()
  }), [snippet]);

  const handleSaveToggle = useCallback(() => {
    try {
      if (isSaved) {
        removeSnippetFromLocalStorage(snippet._id);
        setIsSaved(false);
        toast.success('Snippet removed from saved items');
      } else {
        saveSnippetToLocalStorage(snippet);
        setIsSaved(true);
        toast.success('Snippet saved successfully');
      }
    } catch (error) {
      toast.error('Failed to update saved status');
      console.error('Error updating saved status:', error);
    }
  }, [isSaved, snippet]);

  const handleDelete = useCallback(() => {
    try {
      onDelete(snippet._id);
      toast.success('Snippet deleted successfully');
    } catch (error) {
      toast.error('Failed to delete snippet');
      console.error('Error deleting snippet:', error);
    }
  }, [onDelete, snippet._id]);

  const handleEdit = useCallback(() => {
    onEdit(snippet);
  }, [onEdit, snippet]);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  // Memoize button classes
  const buttonClasses = useMemo(() => ({
    save: `px-3 py-1 rounded transition-colors ${
      isSaved ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
    } text-white`,
    edit: "px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors",
    delete: "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors",
    visibility: "text-blue-500 hover:text-blue-600 text-sm mb-2"
  }), [isSaved]);

  return (
    <div className="bg-white shadow p-4 rounded mb-4">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className={`px-2 py-1 text-xs rounded-full ${
          isPublic 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-gray-600 text-sm">Language: {language}</span>
        {userName && (
          <span className="text-gray-500 text-sm">• Created by: {userName}</span>
        )}
        <span className="text-gray-500 text-sm">• Last Updated: {lastUpdated}</span>
      </div>

      <div className="relative">
        <button
          onClick={togglePreview}
          className={buttonClasses.visibility}
        >
          {showPreview ? 'Hide Code' : 'Show Code'}
        </button>
        
        {showPreview && (
          <Suspense fallback={<CodePreviewFallback />}>
            <CodePreview code={code} language={language} />
          </Suspense>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className={buttonClasses.save}
          onClick={handleSaveToggle}
        >
          {isSaved ? 'Unsave' : 'Save'}
        </button>
        {(onEdit || onDelete) && (
          <>
            {onEdit && (
              <button
                className={buttonClasses.edit}
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className={buttonClasses.delete}
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
});

SnippetCard.propTypes = {
  snippet: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    code: PropTypes.string,
    language: PropTypes.string,
    isPublic: PropTypes.bool,
    updatedAt: PropTypes.string,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      })
    ]),
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default SnippetCard;
