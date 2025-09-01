import React from 'react';
import { Toaster } from 'react-hot-toast';
import { NotesProvider } from './contexts/NotesContext';
import CreateNote from './components/Notes/CreateNote';
import NoteCard from './components/Notes/NoteCard';
import { useNotesContext } from './contexts/NotesContext';
import { Loader, StickyNote } from 'lucide-react';
import './App.css';
import './pages/Dashboard.css';

const SimpleNotePad = () => {
  const { notes, loading } = useNotesContext();

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
            <h1>Luv Notes - Local Version</h1>
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

function App() {
  return (
    <div className="App">
      <NotesProvider useLocal={true}>
        <SimpleNotePad />
      </NotesProvider>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;