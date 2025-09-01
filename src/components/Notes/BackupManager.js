import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Settings, 
  Clock, 
  HardDrive, 
  AlertCircle,
  CheckCircle,
  X,
  Play,
  Pause
} from 'lucide-react';
import BackupService from '../../services/backupService';
import { useTheme } from '../../contexts/ThemeContext';
import './BackupManager.css';

const BackupManager = ({ notes, onClose, isVisible, onRestore }) => {
  const [backupService] = useState(() => new BackupService());
  const [backups, setBackups] = useState([]);
  const [backupStats, setBackupStats] = useState(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoBackupEnabled: true,
    backupIntervalMs: 5 * 60 * 1000, // 5 minutes
    maxBackups: 10
  });
  const { isDark } = useTheme();

  // Initialize backup service
  useEffect(() => {
    if (isVisible) {
      backupService.init();
      loadBackups();
      loadSettings();
    }
  }, [isVisible]);

  // Load backups
  const loadBackups = () => {
    const allBackups = backupService.getAllBackups();
    setBackups(allBackups);
    setBackupStats(backupService.getBackupStats());
  };

  // Load settings
  const loadSettings = () => {
    const currentSettings = {
      autoBackupEnabled: backupService.autoBackupEnabled,
      backupIntervalMs: backupService.backupIntervalMs,
      maxBackups: backupService.maxBackups
    };
    setSettings(currentSettings);
  };

  // Create manual backup
  const handleCreateBackup = async () => {
    if (!notes || notes.length === 0) {
      alert('No notes to backup');
      return;
    }

    setIsCreatingBackup(true);
    try {
      const result = await backupService.createManualBackup(notes, 'user');
      if (result.success) {
        loadBackups();
        alert(`Backup created successfully! ID: ${result.backupId}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Backup creation failed:', error);
      alert(`Backup failed: ${error.message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Restore from backup
  const handleRestore = async (backupId) => {
    if (!confirm('Are you sure you want to restore from this backup? This will overwrite your current notes.')) {
      return;
    }

    setIsRestoring(true);
    try {
      const result = await backupService.restoreFromBackup(backupId);
      if (result.success) {
        if (onRestore) {
          onRestore(result.notes);
        }
        alert('Backup restored successfully!');
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Backup restoration failed:', error);
      alert(`Restore failed: ${error.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Delete backup
  const handleDeleteBackup = async (backupId) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await backupService.deleteBackup(backupId);
      if (result.success) {
        loadBackups();
        alert('Backup deleted successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Backup deletion failed:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Export backup
  const handleExportBackup = (backupId, format = 'json') => {
    try {
      const result = backupService.exportBackup(backupId, format);
      if (result.success) {
        alert(`Backup exported successfully! File: ${result.fileName}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Backup export failed:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  // Import backup
  const handleImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    backupService.importBackup(file)
      .then(result => {
        if (result.success) {
          loadBackups();
          alert(`Backup imported successfully! ID: ${result.backupId}`);
        } else {
          throw new Error(result.error);
        }
      })
      .catch(error => {
        console.error('Backup import failed:', error);
        alert(`Import failed: ${error.message}`);
      });

    // Reset file input
    event.target.value = '';
  };

  // Update settings
  const handleUpdateSettings = () => {
    backupService.updateSettings(settings);
    setShowSettings(false);
    alert('Settings updated successfully!');
  };

  // Clear all backups
  const handleClearAllBackups = () => {
    if (!confirm('Are you sure you want to clear ALL backups? This action cannot be undone.')) {
      return;
    }

    try {
      const result = backupService.clearAllBackups();
      if (result.success) {
        loadBackups();
        alert('All backups cleared successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Clear all backups failed:', error);
      alert(`Clear failed: ${error.message}`);
    }
  };

  // Get readable time
  const getReadableTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Get readable size
  const getReadableSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get readable interval
  const getReadableInterval = (ms) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  if (!isVisible) return null;

  return (
    <div className="backup-overlay">
      <div className={`backup-modal ${isDark ? 'dark' : ''}`}>
        <div className="backup-header">
          <h2>Backup Manager</h2>
          <div className="header-actions">
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Backup Settings"
            >
              <Settings size={18} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="backup-content">
          {/* Settings Panel */}
          {showSettings && (
            <div className="settings-panel">
              <h3>Backup Settings</h3>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoBackupEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoBackupEnabled: e.target.checked }))}
                  />
                  Enable Automatic Backups
                </label>
                <small>Automatically create backups at regular intervals</small>
              </div>
              
              <div className="setting-item">
                <label>Backup Interval:</label>
                <select
                  value={settings.backupIntervalMs}
                  onChange={(e) => setSettings(prev => ({ ...prev, backupIntervalMs: parseInt(e.target.value) }))}
                >
                  <option value={1 * 60 * 1000}>1 minute</option>
                  <option value={5 * 60 * 1000}>5 minutes</option>
                  <option value={15 * 60 * 1000}>15 minutes</option>
                  <option value={30 * 60 * 1000}>30 minutes</option>
                  <option value={60 * 60 * 1000}>1 hour</option>
                </select>
              </div>
              
              <div className="setting-item">
                <label>Maximum Backups:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxBackups}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxBackups: parseInt(e.target.value) }))}
                />
                <small>Old backups will be automatically deleted</small>
              </div>
              
              <div className="setting-actions">
                <button onClick={handleUpdateSettings}>Save Settings</button>
                <button onClick={() => setShowSettings(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
            >
              <Save size={16} />
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </button>
            
            <label className="action-btn">
              <Upload size={16} />
              Import Backup
              <input
                type="file"
                accept=".json,.txt"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </label>
            
            <button 
              className="action-btn danger"
              onClick={handleClearAllBackups}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>

          {/* Backup Statistics */}
          {backupStats && (
            <div className="backup-stats">
              <div className="stat-item">
                <HardDrive size={16} />
                <span>Total Backups: {backupStats.totalBackups}</span>
              </div>
              <div className="stat-item">
                <Clock size={16} />
                <span>Last Backup: {backupStats.lastBackup ? getReadableTime(backupStats.lastBackup) : 'Never'}</span>
              </div>
              <div className="stat-item">
                <Play size={16} />
                <span>Auto Backup: {backupStats.autoBackupEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              {backupStats.nextBackupIn && (
                <div className="stat-item">
                  <Clock size={16} />
                  <span>Next Backup: {getReadableTime(backupStats.nextBackupIn)}</span>
                </div>
              )}
            </div>
          )}

          {/* Backups List */}
          <div className="backups-section">
            <h3>Available Backups</h3>
            {backups.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>No backups found</p>
                <small>Create your first backup to get started</small>
              </div>
            ) : (
              <div className="backups-list">
                {backups.map(backup => (
                  <div key={backup.id} className="backup-item">
                    <div className="backup-info">
                      <div className="backup-header-info">
                        <span className="backup-id">{backup.id}</span>
                        <span className={`backup-type ${backup.metadata.backupType}`}>
                          {backup.metadata.backupType}
                        </span>
                      </div>
                      <div className="backup-details">
                        <span className="backup-time">{getReadableTime(backup.timestamp)}</span>
                        <span className="backup-size">{getReadableSize(backup.metadata.totalSize)}</span>
                        <span className="backup-notes">{backup.metadata.noteCount} notes</span>
                      </div>
                    </div>
                    
                    <div className="backup-actions">
                      <button
                        className="action-btn small"
                        onClick={() => handleRestore(backup.id)}
                        disabled={isRestoring}
                        title="Restore from this backup"
                      >
                        <RotateCcw size={14} />
                      </button>
                      
                      <button
                        className="action-btn small"
                        onClick={() => handleExportBackup(backup.id, 'json')}
                        title="Export as JSON"
                      >
                        <Download size={14} />
                      </button>
                      
                      <button
                        className="action-btn small danger"
                        onClick={() => handleDeleteBackup(backup.id)}
                        title="Delete this backup"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="backup-footer">
          <div className="footer-info">
            <small>
              Backups are stored locally in your browser. 
              Consider exporting important backups to external storage.
            </small>
          </div>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
