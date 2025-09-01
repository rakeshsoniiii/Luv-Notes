import React from 'react';
import CreateNote from '../components/Notes/CreateNote';
import NoteCard from '../components/Notes/NoteCard';
import { useLocalNotes } from '../hooks/useLocalNotes';
import { Loader, StickyNote } from 'lucide-react';
import './Dashboard.css';

const LocalDashboard = () => {
  const { notes, loading } = useLocalNotes();

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
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <StickyNote size={24} />
            <h1>Luv Notes (Local Version)</h1>
          </div>
          <div className="header-right">
            <span className="user-name">Local Storage Demo</span>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <CreateNote />
        
        {notes.length === 0 ? (
          <div className="empty-state">
            <h2>No notes yet</h2>
            <p>Create your first note to get started!</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LocalDashboard;