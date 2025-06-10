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
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCode(initialData.code || "");
      setLanguage(initialData.language || "JavaScript");
      setIsPublic(initialData.isPublic ?? true);
    } else {
      setTitle("");
      setCode("");
      setLanguage("JavaScript");
      setIsPublic(true);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      title, 
      code, 
      language,
      isPublic,
      ...(initialData?._id && { _id: initialData._id })
    });
    
    if (!initialData) {
      setTitle("");
      setCode("");
      setLanguage("JavaScript");
      setIsPublic(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Snippet Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this snippet public
          </label>
        </div>

        <div>
          <textarea
            placeholder="Your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            rows="10"
            required
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors duration-200"
          >
            {initialData ? "Update Snippet" : "Save Snippet"}
          </button>
        </div>
      </div>
    </form>
  );
}

SnippetForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    code: PropTypes.string,
    language: PropTypes.string,
    isPublic: PropTypes.bool,
  }),
};
