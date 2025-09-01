import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  RotateCcw, 
  Download, 
  Eye, 
  GitCompare, 
  Calendar,
  User,
  FileText,
  X,
  Settings,
  Trash2
} from 'lucide-react';
import VersionHistoryService from '../../services/versionHistoryService';
import { useTheme } from '../../contexts/ThemeContext';
import './VersionHistory.css';

const VersionHistory = ({ note, onClose, isVisible, onRestore }) => {
  const [versionService] = useState(() => new VersionHistoryService());
  const [versions, setVersions] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [settings, setSettings] = useState({
    autoSaveEnabled: true,
    autoSaveIntervalMs: 30 * 1000, // 30 seconds
    maxVersionsPerNote: 20
  });
  const { isDark } = useTheme();

  // Initialize version service
  useEffect(() => {
    if (isVisible && note) {
      versionService.init();
      loadVersions();
      loadSettings();
    }
  }, [isVisible, note]);

  // Load versions for the current note
  const loadVersions = () => {
    if (!note) return;
    const noteVersions = versionService.getNoteHistory(note.id);
    setVersions(noteVersions);
  };

  // Load settings
  const loadSettings = () => {
    const currentSettings = {
      autoSaveEnabled: versionService.autoSaveEnabled,
      autoSaveIntervalMs: versionService.autoSaveIntervalMs,
      maxVersionsPerNote: versionService.maxVersionsPerNote
    };
    setSettings(currentSettings);
  };

  // Create version when note changes
  useEffect(() => {
    if (note && versions.length > 0) {
      const latestVersion = versions[0];
      if (latestVersion && (
        latestVersion.data.title !== note.title ||
        latestVersion.data.content !== note.content ||
        latestVersion.data.color !== note.color
      )) {
        // Note has changed, create new version
        versionService.createVersion(note, 'edit', 'Note updated');
        loadVersions();
      }
    }
  }, [note, versions]);

  // Restore to version
  const handleRestore = async (versionId) => {
    if (!confirm('Are you sure you want to restore to this version? This will overwrite your current note.')) {
      return;
    }

    setIsRestoring(true);
    try {
      const result = await versionService.restoreToVersion(note.id, versionId);
      if (result.success) {
        if (onRestore) {
          onRestore(result.restoredNote);
        }
        alert('Note restored successfully!');
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Version restoration failed:', error);
      alert(`Restore failed: ${error.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Compare versions
  const handleCompare = (versionId1, versionId2) => {
    try {
      const result = versionService.compareVersions(note.id, versionId1, versionId2);
      if (result.success) {
        setComparisonData(result);
        setShowComparison(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Version comparison failed:', error);
      alert(`Comparison failed: ${error.message}`);
    }
  };

  // Export version history
  const handleExportHistory = (format = 'json') => {
    try {
      const result = versionService.exportVersionHistory(note.id, format);
      if (result.success) {
        alert(`Version history exported successfully! File: ${result.fileName}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Version history export failed:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  // Delete version
  const handleDeleteVersion = (versionId) => {
    if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: This would need to be implemented in the service
      alert('Version deletion not yet implemented');
    } catch (error) {
      console.error('Version deletion failed:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Update settings
  const handleUpdateSettings = () => {
    versionService.updateSettings(settings);
    setShowSettings(false);
    alert('Settings updated successfully!');
  };

  // Get readable time
  const getReadableTime = (timestamp) => {
    return versionService.getTimeDifference(timestamp);
  };

  // Get readable date
  const getReadableDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get change type icon
  const getChangeTypeIcon = (changeType) => {
    switch (changeType) {
      case 'create':
        return <FileText size={16} />;
      case 'edit':
        return <History size={16} />;
      case 'delete':
        return <Trash2 size={16} />;
      case 'restore':
        return <RotateCcw size={16} />;
      default:
        return <History size={16} />;
    }
  };

  // Get change type color
  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case 'create':
        return '#10b981';
      case 'edit':
        return '#3b82f6';
      case 'delete':
        return '#ef4444';
      case 'restore':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (!isVisible || !note) return null;

  return (
    <div className="version-overlay">
      <div className={`version-modal ${isDark ? 'dark' : ''}`}>
        <div className="version-header">
          <h2>Version History</h2>
          <div className="header-actions">
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Version History Settings"
            >
              <Settings size={18} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="version-content">
          {/* Note Info */}
          <div className="note-info">
            <h3>{note.title || 'Untitled Note'}</h3>
            <div className="note-meta">
              <span className="meta-item">
                <Clock size={14} />
                Created: {getReadableDate(note.createdAt || Date.now())}
              </span>
              <span className="meta-item">
                <History size={14} />
                Last Modified: {getReadableDate(note.updatedAt || Date.now())}
              </span>
              <span className="meta-item">
                <FileText size={14} />
                {versions.length} versions
              </span>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="settings-panel">
              <h4>Version History Settings</h4>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoSaveEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoSaveEnabled: e.target.checked }))}
                  />
                  Enable Auto-Save
                </label>
                <small>Automatically save versions when note changes</small>
              </div>
              
              <div className="setting-item">
                <label>Auto-Save Interval:</label>
                <select
                  value={settings.autoSaveIntervalMs}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoSaveIntervalMs: parseInt(e.target.value) }))}
                >
                  <option value={15 * 1000}>15 seconds</option>
                  <option value={30 * 1000}>30 seconds</option>
                  <option value={60 * 1000}>1 minute</option>
                  <option value={5 * 60 * 1000}>5 minutes</option>
                </select>
              </div>
              
              <div className="setting-item">
                <label>Maximum Versions:</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={settings.maxVersionsPerNote}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxVersionsPerNote: parseInt(e.target.value) }))}
                />
                <small>Old versions will be automatically deleted</small>
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
              onClick={() => handleExportHistory('json')}
            >
              <Download size={16} />
              Export History
            </button>
            
            {selectedVersions.length === 2 && (
              <button 
                className="action-btn"
                onClick={() => handleCompare(selectedVersions[0], selectedVersions[1])}
              >
                <GitCompare size={16} />
                Compare Selected
              </button>
            )}
          </div>

          {/* Versions List */}
          <div className="versions-section">
            <h4>Version Timeline</h4>
            {versions.length === 0 ? (
              <div className="empty-state">
                <History size={48} />
                <p>No versions found</p>
                <small>Start editing your note to create versions</small>
              </div>
            ) : (
              <div className="versions-list">
                {versions.map((version, index) => (
                  <div key={version.id} className="version-item">
                    <div className="version-header-info">
                      <div className="version-select">
                        <input
                          type="checkbox"
                          checked={selectedVersions.includes(version.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selectedVersions.length < 2) {
                                setSelectedVersions(prev => [...prev, version.id]);
                              } else {
                                alert('You can only select 2 versions for comparison');
                              }
                            } else {
                              setSelectedVersions(prev => prev.filter(id => id !== version.id));
                            }
                          }}
                        />
                      </div>
                      
                      <div className="version-icon" style={{ color: getChangeTypeColor(version.changeType) }}>
                        {getChangeTypeIcon(version.changeType)}
                      </div>
                      
                      <div className="version-info">
                        <div className="version-title">
                          {version.changeType.charAt(0).toUpperCase() + version.changeType.slice(1)}
                          {version.changeDescription && `: ${version.changeDescription}`}
                        </div>
                        <div className="version-meta">
                          <span className="version-time">{getReadableTime(version.timestamp)}</span>
                          <span className="version-date">{getReadableDate(version.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="version-actions">
                      <button
                        className="action-btn small"
                        onClick={() => handleRestore(version.id)}
                        disabled={isRestoring}
                        title="Restore to this version"
                      >
                        <RotateCcw size={14} />
                      </button>
                      
                      <button
                        className="action-btn small"
                        onClick={() => {
                          // Show version preview
                          alert(`Version Preview:\nTitle: ${version.data.title}\nContent: ${version.data.content.substring(0, 100)}...`);
                        }}
                        title="Preview this version"
                      >
                        <Eye size={14} />
                      </button>
                      
                      {index > 0 && (
                        <button
                          className="action-btn small"
                          onClick={() => handleCompare(version.id, versions[index - 1].id)}
                          title="Compare with previous version"
                        >
                          <GitCompare size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comparison Panel */}
          {showComparison && comparisonData && (
            <div className="comparison-panel">
              <h4>Version Comparison</h4>
              <div className="comparison-header">
                <div className="version-compare">
                  <span>Version 1: {getReadableDate(comparisonData.version1.timestamp)}</span>
                  <span className="version-type">{comparisonData.version1.changeType}</span>
                </div>
                <div className="version-compare">
                  <span>Version 2: {getReadableDate(comparisonData.version2.timestamp)}</span>
                  <span className="version-type">{comparisonData.version2.changeType}</span>
                </div>
              </div>
              
              <div className="comparison-changes">
                {comparisonData.hasChanges ? (
                  Object.entries(comparisonData.changes).map(([field, change]) => (
                    change.changed && (
                      <div key={field} className="change-item">
                        <h5>{field.charAt(0).toUpperCase() + field.slice(1)}</h5>
                        <div className="change-details">
                          <div className="change-old">
                            <strong>Old:</strong> {change.old || 'None'}
                          </div>
                          <div className="change-new">
                            <strong>New:</strong> {change.new || 'None'}
                          </div>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <p>No changes detected between these versions.</p>
                )}
              </div>
              
              <div className="comparison-actions">
                <button onClick={() => setShowComparison(false)}>Close</button>
              </div>
            </div>
          )}
        </div>

        <div className="version-footer">
          <div className="footer-info">
            <small>
              Version history tracks all changes to your note. 
              You can restore to any previous version or compare changes between versions.
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

export default VersionHistory;
