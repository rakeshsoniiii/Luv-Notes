import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import CreateNote from '../components/Notes/CreateNote';
import NoteCard from '../components/Notes/NoteCard';
import AISearch from '../components/AI/AISearch';
import VoiceNoteCreator from '../components/AI/VoiceNoteCreator';
import ImageNoteCreator from '../components/AI/ImageNoteCreator';
import { useNotesContext } from '../contexts/FirebaseNotesContext';
import { Loader, Mic, Camera } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { notes, loading } = useNotesContext();
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceCreator, setShowVoiceCreator] = useState(false);
  const [showImageCreator, setShowImageCreator] = useState(false);

  const handleSearchResults = (results, query) => {
    setFilteredNotes(results);
    setSearchQuery(query);
  };

  const displayNotes = searchQuery ? filteredNotes : notes;

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={32} />
        <p>Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard-content">
        <div className="create-options">
          <CreateNote />
          <div className="ai-features">
            <button 
              className="voice-note-btn"
              onClick={() => setShowVoiceCreator(true)}
              title="Create voice note"
            >
              <Mic size={20} />
              <span>Voice Note</span>
            </button>
            <button 
              className="image-note-btn"
              onClick={() => setShowImageCreator(true)}
              title="Create note from image"
            >
              <Camera size={20} />
              <span>Image Note</span>
            </button>
          </div>
        </div>
        
        {notes.length > 0 && (
          <AISearch onSearchResults={handleSearchResults} />
        )}
        
        {searchQuery && (
          <div className="search-results-header">
            <h3>Search Results for "{searchQuery}" ({displayNotes.length} found)</h3>
          </div>
        )}
        
        {notes.length === 0 ? (
          <div className="empty-state">
            <h2>No notes yet</h2>
            <p>Create your first AI-powered note to get started!</p>
          </div>
        ) : displayNotes.length === 0 && searchQuery ? (
          <div className="empty-state">
            <h2>No notes found</h2>
            <p>Try a different search term or create a new note.</p>
          </div>
        ) : (
          <div className="notes-grid">
            {displayNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </main>
      
      {showVoiceCreator && (
        <VoiceNoteCreator onClose={() => setShowVoiceCreator(false)} />
      )}
      
      {showImageCreator && (
        <ImageNoteCreator onClose={() => setShowImageCreator(false)} />
      )}
    </div>
  );
};

export default Dashboard;