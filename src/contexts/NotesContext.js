import React, { createContext, useContext } from 'react';
import { useLocalNotes } from '../hooks/useLocalNotes';

const NotesContext = createContext();

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children, useLocal = false }) => {
  // Always call both hooks to avoid conditional hook calls
  const localNotes = useLocalNotes();
  
  // For the simple version, we'll just use local notes
  // The Firebase version will be in a separate file
  const notesData = localNotes;
  
  return (
    <NotesContext.Provider value={notesData}>
      {children}
    </NotesContext.Provider>
  );
};