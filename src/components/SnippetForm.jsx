import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const SnippetForm = React.memo(({ onSubmit, initialData = null }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState("");

  // Reset form fields
  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setCode("");
    setLanguage("JavaScript");
    setIsPublic(true);
    setTags("");
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCode(initialData.code || "");
      setLanguage(initialData.language || "JavaScript");
      setIsPublic(initialData.isPublic ?? true);
      setTags((initialData.tags || []).join(", "));
    } else {
      resetForm();
    }
  }, [initialData, resetForm]);

  const handleSubmit = useCallback((e) => {
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
      resetForm();
    }
  }, [title, description, code, language, isPublic, tags, initialData, onSubmit, resetForm]);

  const handleCancel = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // Memoize input handlers
  const handleTitleChange = useCallback((e) => setTitle(e.target.value), []);
  const handleDescriptionChange = useCallback((e) => setDescription(e.target.value), []);
  const handleCodeChange = useCallback((e) => setCode(e.target.value), []);
  const handleLanguageChange = useCallback((e) => setLanguage(e.target.value), []);
  const handleIsPublicChange = useCallback((e) => setIsPublic(e.target.checked), []);
  const handleTagsChange = useCallback((e) => setTags(e.target.value), []);

  // Memoize static values
  const formClasses = useMemo(() => ({
    container: "bg-white p-6 rounded-lg shadow-md mb-6",
    input: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500",
    label: "block text-sm font-medium text-gray-700",
    checkbox: "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded",
    checkboxLabel: "ml-2 block text-sm text-gray-900",
    buttonContainer: "mt-6 flex justify-end space-x-3",
    cancelButton: "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
    submitButton: "inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  }), []);

  return (
    <form onSubmit={handleSubmit} className={formClasses.container}>
      <div className="space-y-4">
        <div>
          <label className={formClasses.label}>Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={formClasses.input}
            required
          />
        </div>
        <div>
          <label className={formClasses.label}>Description</label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className={formClasses.input}
            rows="3"
          />
        </div>
        <div>
          <label className={formClasses.label}>Code</label>
          <textarea
            value={code}
            onChange={handleCodeChange}
            className={`${formClasses.input} font-mono`}
            rows="10"
            required
          />
        </div>
        <div>
          <label className={formClasses.label}>Language</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className={formClasses.input}
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
            onChange={handleIsPublicChange}
            className={formClasses.checkbox}
          />
          <label htmlFor="isPublic" className={formClasses.checkboxLabel}>
            Public Snippet
          </label>
        </div>
        <div>
          <label className={formClasses.label}>Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={handleTagsChange}
            className={formClasses.input}
          />
        </div>
      </div>
      <div className={formClasses.buttonContainer}>
        <button
          type="button"
          onClick={handleCancel}
          className={formClasses.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={formClasses.submitButton}
        >
          {initialData ? "Update Snippet" : "Create Snippet"}
        </button>
      </div>
    </form>
  );
});

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

export default SnippetForm;
