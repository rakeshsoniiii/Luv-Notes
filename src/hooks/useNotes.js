import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Query for active notes (not archived)
    const activeNotesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', currentUser.uid),
      where('archived', '==', false)
    );

    // Query for archived notes
    const archivedNotesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', currentUser.uid),
      where('archived', '==', true)
    );

    const unsubscribeActive = onSnapshot(activeNotesQuery, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort manually since we removed orderBy to avoid index issues
      notesData.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setNotes(notesData);
      setLoading(false);
      console.log('Active notes loaded:', notesData.length);
    }, (error) => {
      console.error('Error fetching active notes:', error);
      toast.error('Failed to load notes: ' + error.message);
      setLoading(false);
    });

    const unsubscribeArchived = onSnapshot(archivedNotesQuery, (snapshot) => {
      const archivedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by archived date
      archivedData.sort((a, b) => {
        const aTime = a.archivedAt?.toDate?.() || new Date(0);
        const bTime = b.archivedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      setArchivedNotes(archivedData);
      console.log('Archived notes loaded:', archivedData.length);
    }, (error) => {
      console.error('Error fetching archived notes:', error);
    });

    return () => {
      unsubscribeActive();
      unsubscribeArchived();
    };
  }, [currentUser]);

  const addNote = async (title, content, color = '#ffffff') => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'notes'), {
        title: title || 'Untitled',
        content: content || '',
        color,
        userId: currentUser.uid,
        archived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Note created');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNote = async (noteId, updates) => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const archiveNote = async (noteId) => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        archived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Note archived');
    } catch (error) {
      console.error('Error archiving note:', error);
      toast.error('Failed to archive note');
    }
  };

  const unarchiveNote = async (noteId) => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        archived: false,
        archivedAt: null,
        updatedAt: serverTimestamp()
      });
      toast.success('Note restored');
    } catch (error) {
      console.error('Error restoring note:', error);
      toast.error('Failed to restore note');
    }
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