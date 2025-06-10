import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const SUPPORTED_LANGUAGES = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Go",
  "Rust",
  "TypeScript",
  "HTML",
  "CSS",
  "SQL",
  "Other"
];

export default function SnippetForm({ onSubmit, initialData = null }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCode(initialData.code || "");
      setLanguage(initialData.language || "JavaScript");
      setIsPublic(initialData.isPublic ?? true);
      setTags((initialData.tags || []).join(", "));
    } else {
      setTitle("");
      setDescription("");
      setCode("");
      setLanguage("JavaScript");
      setIsPublic(true);
      setTags("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      code,
      language,
      isPublic,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
      ...(initialData?._id && { _id: initialData._id })
    });
    
    if (!initialData) {
      setTitle("");
      setDescription("");
      setCode("");
      setLanguage("JavaScript");
      setIsPublic(true);
      setTags("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            rows="10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang.toLowerCase()}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Public Snippet
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            // Reset form fields on cancel
            setTitle("");
            setDescription("");
            setCode("");
            setLanguage("JavaScript");
            setIsPublic(true);
            setTags("");
            // Optionally, if the form is controlled by a parent that handles visibility,
            // the parent will handle hiding the form.
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? "Update Snippet" : "Create Snippet"}
        </button>
      </div>
    </form>
  );
}

SnippetForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    code: PropTypes.string,
    language: PropTypes.string,
    isPublic: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};
