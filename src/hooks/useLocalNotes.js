import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useLocalNotes = () => {
  const [notes, setNotes] = useState([]);
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('luv-notes-local');
    const savedArchived = localStorage.getItem('luv-notes-archived');
    
    if (savedNotes) {
      const allNotes = JSON.parse(savedNotes);
      const activeNotes = allNotes.filter(note => !note.archived);
      setNotes(activeNotes);
    }
    
    if (savedArchived) {
      setArchivedNotes(JSON.parse(savedArchived));
    }
    
    setLoading(false);
  }, []);

  const saveToStorage = (updatedNotes, updatedArchived = archivedNotes) => {
    localStorage.setItem('luv-notes-local', JSON.stringify(updatedNotes));
    localStorage.setItem('luv-notes-archived', JSON.stringify(updatedArchived));
    setNotes(updatedNotes);
    setArchivedNotes(updatedArchived);
  };

  const addNote = async (title, content, color = '#ffffff') => {
    const newNote = {
      id: Date.now().toString(),
      title: title || 'Untitled',
      content: content || '',
      color,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedNotes = [newNote, ...notes];
    saveToStorage(updatedNotes);
    toast.success('Note created');
  };

  const updateNote = async (noteId, updates) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    );
    saveToStorage(updatedNotes);
  };

  const archiveNote = async (noteId) => {
    const noteToArchive = notes.find(note => note.id === noteId);
    if (noteToArchive) {
      const archivedNote = {
        ...noteToArchive,
        archived: true,
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedNotes = notes.filter(note => note.id !== noteId);
      const updatedArchived = [archivedNote, ...archivedNotes];
      
      saveToStorage(updatedNotes, updatedArchived);
      toast.success('Note archived');
    }
  };

  const unarchiveNote = async (noteId) => {
    const noteToRestore = archivedNotes.find(note => note.id === noteId);
    if (noteToRestore) {
      const restoredNote = {
        ...noteToRestore,
        archived: false,
        archivedAt: null,
        updatedAt: new Date().toISOString()
      };
      
      const updatedArchived = archivedNotes.filter(note => note.id !== noteId);
      const updatedNotes = [restoredNote, ...notes];
      
      saveToStorage(updatedNotes, updatedArchived);
      toast.success('Note restored');
    }
  };

  const deleteNote = async (noteId) => {
    // Check if note is in active notes or archived notes
    const isInActive = notes.some(note => note.id === noteId);
    const isInArchived = archivedNotes.some(note => note.id === noteId);
    
    if (isInActive) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      saveToStorage(updatedNotes);
    } else if (isInArchived) {
      const updatedArchived = archivedNotes.filter(note => note.id !== noteId);
      saveToStorage(notes, updatedArchived);
    }
    
    toast.success('Note deleted');
  };

  return {
    notes,
    archivedNotes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    archiveNote,
    unarchiveNote
  };
};