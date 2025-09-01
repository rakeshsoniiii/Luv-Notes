import React, { useState } from 'react';
import { X, Archive, Trash2, Download, Upload, Heart, User, Palette, Shield, HelpCircle, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotesContext } from '../../contexts/FirebaseNotesContext';
import HeartLogo from '../UI/HeartLogo';
import HiddenNotes from '../Notes/HiddenNotes';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { theme, isDark, setIsDark } = useTheme();
  const { 
    notes = [], 
    archivedNotes = [], 
    unarchiveNote, 
    deleteNote, 
    hiddenNotes = [] 
  } = useNotesContext();
  const [activeTab, setActiveTab] = useState('general');
  const [showHiddenNotes, setShowHiddenNotes] = useState(false);

  const handleExportNotes = () => {
    const allNotes = [...(notes || []), ...(archivedNotes || [])];
    const dataStr = JSON.stringify(allNotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luv-notes-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Notes exported successfully!');
  };

  const handleDeleteAllArchived = async () => {
    if (!archivedNotes || archivedNotes.length === 0) {
      toast.error('No archived notes to delete');
      return;
    }
    
    if (window.confirm('Are you sure you want to permanently delete all archived notes? This action cannot be undone.')) {
      try {
        for (const note of archivedNotes) {
          await deleteNote(note.id);
        }
        toast.success('All archived notes deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete archived notes');
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'archives', label: 'Archives', icon: Archive },
    { id: 'hidden', label: 'Hidden Notes', icon: EyeOff },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
    { id: 'about', label: 'About', icon: HelpCircle }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <h3>Account Information</h3>
            <div className="account-info">
              <div className="user-avatar">
                <User size={40} />
              </div>
              <div className="user-details">
                <h4>{currentUser?.displayName || 'User'}</h4>
                <p>{currentUser?.email}</p>
                <small>Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}</small>
              </div>
            </div>
            
            <div className="settings-group">
              <h4>Preferences</h4>
              <div className="setting-item">
                <div className="setting-info">
                  <span>Notifications</span>
                  <small>Get notified about important updates</small>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <span>Auto-save</span>
                  <small>Automatically save notes as you type</small>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h3>Appearance Settings</h3>
            <div className="settings-group">
              <h4>Theme</h4>
              <div className="theme-preview">
                <div className="current-theme">
                  <HeartLogo size="small" color="primary" />
                  <span>Current: {theme.replace('theme-', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <p>Customize your theme in the header theme selector</p>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <span>Dark Mode</span>
                  <small>Use dark theme for better night viewing</small>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={isDark}
                    onChange={(e) => setIsDark(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'archives':
        return (
          <div className="settings-section">
            <h3>Archived Notes</h3>
            <div className="archive-stats">
              <div className="stat-card">
                <Archive size={24} />
                <div>
                  <h4>{archivedNotes?.length || 0}</h4>
                  <p>Archived Notes</p>
                </div>
              </div>
              <div className="stat-card">
                <Heart size={24} />
                <div>
                  <h4>{notes?.length || 0}</h4>
                  <p>Active Notes</p>
                </div>
              </div>
            </div>
            
            {(archivedNotes?.length || 0) > 0 && (
              <div className="archive-actions">
                <button 
                  className="btn-danger"
                  onClick={handleDeleteAllArchived}
                >
                  <Trash2 size={16} />
                  Delete All Archived
                </button>
              </div>
            )}
            
            <div className="archived-notes-list">
              {(!archivedNotes || archivedNotes.length === 0) ? (
                <div className="empty-archives">
                  <Archive size={48} />
                  <h4>No archived notes</h4>
                  <p>Archived notes will appear here</p>
                </div>
              ) : (
                archivedNotes.map(note => (
                  <div key={note.id} className="archived-note-item">
                    <div className="note-info">
                      <h5>{note.title || 'Untitled'}</h5>
                      <p>{note.content?.substring(0, 100)}...</p>
                      <small>Archived on {new Date(note.archivedAt).toLocaleDateString()}</small>
                    </div>
                    <div className="note-actions">
                      <button 
                        className="btn-restore"
                        onClick={() => unarchiveNote(note.id)}
                        title="Restore note"
                      >
                        <Upload size={16} />
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteNote(note.id)}
                        title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="settings-section">
            <h3>Data & Privacy</h3>
            <div className="settings-group">
              <h4>Data Management</h4>
              <div className="data-actions">
                <button className="btn-export" onClick={handleExportNotes}>
                  <Download size={16} />
                  Export All Notes
                </button>
                <small>Download all your notes as JSON file</small>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <span>Data Sync</span>
                  <small>Sync your notes across devices</small>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <div className="settings-group">
              <h4>Privacy</h4>
              <div className="privacy-info">
                <p>Your notes are stored securely and encrypted. We never share your personal data with third parties.</p>
                <p>All AI processing is done securely and your content is not stored by AI services.</p>
              </div>
            </div>
          </div>
        );

      case 'hidden':
        return (
          <div className="settings-section">
            <h3>Hidden Notes</h3>
            <div className="hidden-stats">
              <div className="stat-card">
                <EyeOff size={24} />
                <div>
                  <h4>{hiddenNotes?.length || 0}</h4>
                  <p>Hidden Notes</p>
                </div>
              </div>
              <div className="stat-card">
                <Shield size={24} />
                <div>
                  <h4>Protected</h4>
                  <p>4-Digit Password</p>
                </div>
              </div>
            </div>
            
            <div className="hidden-info">
              <p>Hidden notes are stored locally and protected with a 4-digit password. Only you can access them.</p>
              <p>Use the "Hide Note" option on any note to move it to hidden notes.</p>
            </div>
            
            <div className="hidden-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowHiddenNotes(true)}
              >
                <EyeOff size={16} />
                Access Hidden Notes
              </button>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="settings-section">
            <h3>About Luv Notes</h3>
            <div className="about-content">
              <div className="app-info">
                <HeartLogo size="large" color="primary" animated={true} />
                <h4>Luv Notes</h4>
                <p>Your lovely AI-powered note-taking companion</p>
                <small>Version 1.0.0</small>
              </div>
              
              <div className="features-list">
                <h4>Features</h4>
                <ul>
                  <li>✨ AI-powered note enhancement</li>
                  <li>🎤 Voice-to-text notes</li>
                  <li>📸 Image-to-text extraction</li>
                  <li>🎨 Beautiful love themes</li>
                  <li>☁️ Real-time sync</li>
                  <li>📱 Mobile responsive</li>
                </ul>
              </div>
              
              <div className="credits">
                <h4>Credits</h4>
                <p>Built with love using React, Firebase by team Rudraksha</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="header-title">
            <HeartLogo size="small" color="primary" />
            <h2>Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="settings-main">
            {renderTabContent()}
          </div>
        </div>

        <div className="settings-footer">
          <div className="footer-content">
            <HeartLogo size="small" color="primary" />
            <span>Luv Notes By RUDRAKSHA</span>
          </div>
        </div>
      </div>

      {showHiddenNotes && (
        <HiddenNotes onClose={() => setShowHiddenNotes(false)} />
      )}
    </div>
  );
};

export default Settings;