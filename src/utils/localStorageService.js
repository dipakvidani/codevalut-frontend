export const saveSnippetToLocalStorage = (snippet) => {
  const savedSnippets = JSON.parse(localStorage.getItem('savedSnippets') || '[]');
  const isAlreadySaved = savedSnippets.some(s => s._id === snippet._id);
  
  if (!isAlreadySaved) {
    localStorage.setItem('savedSnippets', JSON.stringify([...savedSnippets, snippet]));
    return true;
  }
  return false;
};

export const removeSnippetFromLocalStorage = (snippetId) => {
  const savedSnippets = JSON.parse(localStorage.getItem('savedSnippets') || '[]');
  const filteredSnippets = savedSnippets.filter(s => s._id !== snippetId);
  localStorage.setItem('savedSnippets', JSON.stringify(filteredSnippets));
};

export const getSavedSnippetsFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem('savedSnippets') || '[]');
};

export const isSnippetSaved = (snippetId) => {
  const savedSnippets = JSON.parse(localStorage.getItem('savedSnippets') || '[]');
  return savedSnippets.some(s => s._id === snippetId);
}; 