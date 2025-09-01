import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, X, Shield } from 'lucide-react';
import { useNotesContext } from '../../contexts/FirebaseNotesContext';
import NoteCard from './NoteCard';
import toast from 'react-hot-toast';
import './HiddenNotes.css';

const HiddenNotes = ({ onClose }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const { hiddenNotes = [], addHiddenNote, getHiddenPassword, setHiddenPassword } = useNotesContext();

  const checkPasswordExists = useCallback(async () => {
    const existingPassword = await getHiddenPassword();
    if (!existingPassword) {
      setIsSettingPassword(true);
    }
  }, [getHiddenPassword]);

  useEffect(() => {
    checkPasswordExists();
  }, [checkPasswordExists]);

  const handleSetPassword = async () => {
    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
      toast.error('Password must be exactly 4 digits');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await setHiddenPassword(password);
      setIsSettingPassword(false);
      setIsUnlocked(true);
      toast.success('Hidden notes password set successfully!');
    } catch (error) {
      toast.error('Failed to set password');
    }
  };

  const handleUnlock = async () => {
    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
      toast.error('Password must be exactly 4 digits');
      return;
    }

    try {
      const storedPassword = await getHiddenPassword();
      if (password === storedPassword) {
        setIsUnlocked(true);
        setPassword('');
        toast.success('Hidden notes unlocked!');
      } else {
        toast.error('Incorrect password');
        setPassword('');
      }
    } catch (error) {
      toast.error('Failed to verify password');
    }
  };

  const handleCreateHiddenNote = async () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) {
      toast.error('Please add a title or content');
      return;
    }

    try {
      await addHiddenNote(newNoteTitle || 'Hidden Note', newNoteContent);
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowCreateNote(false);
      toast.success('Hidden note created!');
    } catch (error) {
      toast.error('Failed to create hidden note');
    }
  };

  const handlePasswordInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(value);
  };

  const handleConfirmPasswordInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setConfirmPassword(value);
  };

  if (isSettingPassword) {
    return (
      <div className="hidden-notes-overlay">
        <div className="hidden-notes-modal">
          <div className="hidden-notes-header">
            <div className="header-title">
              <Shield size={20} />
              <h3>Set Hidden Notes Password</h3>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="password-setup">
            <div className="setup-info">
              <Lock size={48} />
              <h4>Secure Your Hidden Notes</h4>
              <p>Set a 4-digit password to protect your private notes. Only you will be able to access them.</p>
            </div>

            <div className="password-inputs">
              <div className="input-group">
                <label>Enter 4-digit password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordInput}
                  placeholder="••••"
                  className="password-input"
                  maxLength={4}
                />
              </div>

              <div className="input-group">
                <label>Confirm password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordInput}
                  placeholder="••••"
                  className="password-input"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="setup-actions">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSetPassword}
                disabled={password.length !== 4 || confirmPassword.length !== 4}
              >
                <Lock size={16} />
                Set Password
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="hidden-notes-overlay">
        <div className="hidden-notes-modal">
          <div className="hidden-notes-header">
            <div className="header-title">
              <EyeOff size={20} />
              <h3>Hidden Notes</h3>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="password-unlock">
            <div className="unlock-info">
              <Lock size={48} />
              <h4>Enter Password</h4>
              <p>Enter your 4-digit password to access hidden notes</p>
            </div>

            <div className="password-input-container">
              <input
                type="password"
                value={password}
                onChange={handlePasswordInput}
                placeholder="••••"
                className="password-input large"
                maxLength={4}
                autoFocus
              />
            </div>

            <div className="unlock-actions">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleUnlock}
                disabled={password.length !== 4}
              >
                <Unlock size={16} />
                Unlock
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden-notes-overlay">
      <div className="hidden-notes-modal large">
        <div className="hidden-notes-header">
          <div className="header-title">
            <Eye size={20} />
            <h3>Hidden Notes</h3>
            <span className="notes-count">({hiddenNotes?.length || 0})</span>
          </div>
          <div className="header-actions">
            <button 
              className="btn-primary small"
              onClick={() => setShowCreateNote(true)}
            >
              <Plus size={16} />
              New Hidden Note
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="hidden-notes-content">
          {showCreateNote && (
            <div className="create-note-form">
              <h4>Create Hidden Note</h4>
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title..."
                className="note-title-input"
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your private note here..."
                className="note-content-input"
                rows={4}
              />
              <div className="form-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateNote(false);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                  }}
                >
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCreateHiddenNote}>
                  <Plus size={16} />
                  Create Hidden Note
                </button>
              </div>
            </div>
          )}

          <div className="hidden-notes-grid">
            {(!hiddenNotes || hiddenNotes.length === 0) ? (
              <div className="empty-hidden-notes">
                <EyeOff size={48} />
                <h4>No Hidden Notes</h4>
                <p>Your private notes will appear here</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowCreateNote(true)}
                >
                  <Plus size={16} />
                  Create First Hidden Note
                </button>
              </div>
            ) : (
              hiddenNotes.map(note => (
                <div key={note.id} className="hidden-note-wrapper">
                  <div className="hidden-note-indicator">
                    <EyeOff size={12} />
                  </div>
                  <NoteCard note={note} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hidden-notes-footer">
          <div className="security-info">
            <Shield size={16} />
            <span>Your hidden notes are encrypted and secure</span>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => {
              setIsUnlocked(false);
              setPassword('');
            }}
          >
            <Lock size={16} />
            Lock Hidden Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default HiddenNotes;