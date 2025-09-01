import React, { useState, useEffect } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { useNotesContext } from "../../contexts/FirebaseNotesContext";
import geminiService from "../../services/geminiService";
import "./AISearch.css";

const AISearch = ({ onSearchResults }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { notes } = useNotesContext();

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(async () => {
        try {
          const aiSuggestions = await geminiService.getSearchSuggestions(
            query,
            notes
          );
          setSuggestions(aiSuggestions.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error getting AI suggestions:", error);
        }
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, notes]);

  const performSearch = async (searchQuery) => {
    setIsSearching(true);

    try {
      // Basic text search
      const results = notes.filter((note) => {
        const titleMatch = note.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const contentMatch = note.content
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return titleMatch || contentMatch;
      });

      onSearchResults(results, searchQuery);
    } catch (error) {
      console.error("Search error:", error);
      onSearchResults([], searchQuery);
    } finally {
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      await performSearch(query);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion);
    await performSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onSearchResults(notes, "");
  };

  return (
    <div className="ai-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes with AI assistance..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            disabled={isSearching}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="clear-search-btn"
            >
              <X size={16} />
            </button>
          )}
          <Sparkles size={16} className="ai-indicator" />
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          <div className="suggestions-header">
            <Sparkles size={14} />
            <span>AI Suggestions</span>
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISearch;
