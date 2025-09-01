import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNotes } from "../hooks/useNotes";
import { useLocalNotes } from "../hooks/useLocalNotes";

const NotesContext = createContext();

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotesContext must be used within a NotesProvider");
  }
  return context;
};

export const FirebaseNotesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [hiddenNotes, setHiddenNotes] = useState([]);

  // Always call both hooks to avoid conditional hook calls
  const firebaseNotes = useNotes();
  const localNotes = useLocalNotes();

  // Use Firebase notes if user is authenticated, otherwise local notes
  const notesData = currentUser ? firebaseNotes : localNotes;

  // Load hidden notes from localStorage
  useEffect(() => {
    const loadHiddenNotes = () => {
      try {
        const stored = localStorage.getItem('hiddenNotes');
        if (stored) {
          setHiddenNotes(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading hidden notes:', error);
      }
    };
    loadHiddenNotes();
  }, []);

  // Save hidden notes to localStorage
  const saveHiddenNotes = (notes) => {
    try {
      localStorage.setItem('hiddenNotes', JSON.stringify(notes));
      setHiddenNotes(notes);
    } catch (error) {
      console.error('Error saving hidden notes:', error);
    }
  };

  // Hidden notes functions
  const addHiddenNote = async (title, content) => {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      color: '#ffffff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isHidden: true
    };
    
    const updatedNotes = [...hiddenNotes, newNote];
    saveHiddenNotes(updatedNotes);
    return newNote;
  };

  const updateHiddenNote = async (id, updates) => {
    const updatedNotes = hiddenNotes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    );
    saveHiddenNotes(updatedNotes);
  };

  const deleteHiddenNote = async (id) => {
    const updatedNotes = hiddenNotes.filter(note => note.id !== id);
    saveHiddenNotes(updatedNotes);
  };

  const getHiddenPassword = async () => {
    return localStorage.getItem('hiddenNotesPassword');
  };

  const setHiddenPassword = async (password) => {
    localStorage.setItem('hiddenNotesPassword', password);
  };

  // Enhanced context value with hidden notes
  const contextValue = {
    // Ensure all arrays are always defined
    notes: notesData?.notes || [],
    archivedNotes: notesData?.archivedNotes || [],
    loading: notesData?.loading || false,
    hiddenNotes: hiddenNotes || [],
    
    // Pass through all other functions from notesData
    addNote: notesData?.addNote || (() => Promise.resolve()),
    updateNote: notesData?.updateNote || (() => Promise.resolve()),
    archiveNote: notesData?.archiveNote || (() => Promise.resolve()),
    unarchiveNote: notesData?.unarchiveNote || (() => Promise.resolve()),
    
    // Hidden notes functions
    addHiddenNote,
    updateHiddenNote: (id, updates) => {
      // Check if it's a hidden note
      const hiddenNote = (hiddenNotes || []).find(note => note.id === id);
      if (hiddenNote) {
        return updateHiddenNote(id, updates);
      }
      return notesData?.updateNote ? notesData.updateNote(id, updates) : Promise.resolve();
    },
    deleteNote: (id) => {
      // Check if it's a hidden note
      const hiddenNote = (hiddenNotes || []).find(note => note.id === id);
      if (hiddenNote) {
        return deleteHiddenNote(id);
      }
      return notesData?.deleteNote ? notesData.deleteNote(id) : Promise.resolve();
    },
    getHiddenPassword,
    setHiddenPassword
  };

  return (
    <NotesContext.Provider value={contextValue}>{children}</NotesContext.Provider>
  );
};
