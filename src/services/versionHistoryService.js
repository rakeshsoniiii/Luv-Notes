class VersionHistoryService {
  constructor() {
    this.historyKey = 'luv_notes_version_history';
    this.maxVersionsPerNote = 20; // Keep last 20 versions per note
    this.autoSaveEnabled = true;
    this.autoSaveIntervalMs = 30 * 1000; // 30 seconds
    this.autoSaveTimer = null;
  }

  // Initialize version history service
  init() {
    this.loadSettings();
    if (this.autoSaveEnabled) {
      this.startAutoSave();
    }
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const settings = localStorage.getItem('luv_notes_version_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.autoSaveEnabled = parsed.autoSaveEnabled !== false;
        this.autoSaveIntervalMs = parsed.autoSaveIntervalMs || this.autoSaveIntervalMs;
        this.maxVersionsPerNote = parsed.maxVersionsPerNote || this.maxVersionsPerNote;
      }
    } catch (error) {
      console.error('Error loading version history settings:', error);
    }
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      const settings = {
        autoSaveEnabled: this.autoSaveEnabled,
        autoSaveIntervalMs: this.autoSaveIntervalMs,
        maxVersionsPerNote: this.maxVersionsPerNote
      };
      localStorage.setItem('luv_notes_version_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving version history settings:', error);
    }
  }

  // Start auto-save timer
  startAutoSave() {
    if (!this.autoSaveEnabled) return;

    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      // Auto-save will be triggered by note changes
    }, this.autoSaveIntervalMs);

    console.log(`Version history auto-save started with ${this.autoSaveIntervalMs / 1000}s interval`);
  }

  // Stop auto-save timer
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Create a new version of a note
  createVersion(note, changeType = 'edit', changeDescription = '') {
    try {
      const version = {
        id: this.generateVersionId(),
        noteId: note.id,
        timestamp: Date.now(),
        changeType, // 'create', 'edit', 'delete', 'restore'
        changeDescription,
        data: {
          title: note.title,
          content: note.content,
          color: note.color,
          metadata: note.metadata || {}
        },
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId()
      };

      this.saveVersion(version);
      this.cleanupOldVersions(note.id);

      console.log(`Version created for note ${note.id}: ${changeType}`);
      
      return {
        success: true,
        versionId: version.id,
        timestamp: version.timestamp
      };
    } catch (error) {
      console.error('Error creating version:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save version to localStorage
  saveVersion(version) {
    try {
      const history = this.getAllHistory();
      
      // Find or create note history
      let noteHistory = history.find(h => h.noteId === version.noteId);
      if (!noteHistory) {
        noteHistory = {
          noteId: version.noteId,
          versions: [],
          createdAt: Date.now(),
          lastModified: Date.now()
        };
        history.push(noteHistory);
      }

      // Add new version
      noteHistory.versions.push(version);
      noteHistory.lastModified = Date.now();

      // Sort versions by timestamp (newest first)
      noteHistory.versions.sort((a, b) => b.timestamp - a.timestamp);

      localStorage.setItem(this.historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving version:', error);
      throw error;
    }
  }

  // Get all version history
  getAllHistory() {
    try {
      const history = localStorage.getItem(this.historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading version history:', error);
      return [];
    }
  }

  // Get version history for a specific note
  getNoteHistory(noteId) {
    try {
      const history = this.getAllHistory();
      const noteHistory = history.find(h => h.noteId === noteId);
      return noteHistory ? noteHistory.versions : [];
    } catch (error) {
      console.error('Error getting note history:', error);
      return [];
    }
  }

  // Get specific version
  getVersion(noteId, versionId) {
    try {
      const versions = this.getNoteHistory(noteId);
      return versions.find(v => v.id === versionId);
    } catch (error) {
      console.error('Error getting version:', error);
      return null;
    }
  }

  // Get latest version of a note
  getLatestVersion(noteId) {
    try {
      const versions = this.getNoteHistory(noteId);
      return versions.length > 0 ? versions[0] : null;
    } catch (error) {
      console.error('Error getting latest version:', error);
      return null;
    }
  }

  // Get version by timestamp (closest match)
  getVersionByTimestamp(noteId, timestamp) {
    try {
      const versions = this.getNoteHistory(noteId);
      if (versions.length === 0) return null;

      // Find closest timestamp
      let closest = versions[0];
      let minDiff = Math.abs(versions[0].timestamp - timestamp);

      for (const version of versions) {
        const diff = Math.abs(version.timestamp - timestamp);
        if (diff < minDiff) {
          minDiff = diff;
          closest = version;
        }
      }

      return closest;
    } catch (error) {
      console.error('Error getting version by timestamp:', error);
      return null;
    }
  }

  // Restore note to a specific version
  async restoreToVersion(noteId, versionId) {
    try {
      const version = this.getVersion(noteId, versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Create a new version to track the restoration
      const restoredNote = {
        id: noteId,
        title: version.data.title,
        content: version.data.content,
        color: version.data.color,
        metadata: version.data.metadata
      };

      // Create restoration version
      this.createVersion(restoredNote, 'restore', `Restored from version ${versionId}`);

      console.log(`Note ${noteId} restored to version ${versionId}`);
      
      return {
        success: true,
        restoredNote,
        versionId,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error restoring to version:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Compare two versions
  compareVersions(noteId, versionId1, versionId2) {
    try {
      const version1 = this.getVersion(noteId, versionId1);
      const version2 = this.getVersion(noteId, versionId2);

      if (!version1 || !version2) {
        throw new Error('One or both versions not found');
      }

      const changes = {
        title: {
          changed: version1.data.title !== version2.data.title,
          old: version1.data.title,
          new: version2.data.title
        },
        content: {
          changed: version1.data.content !== version2.data.content,
          old: version1.data.content,
          new: version2.data.content
        },
        color: {
          changed: version1.data.color !== version2.data.color,
          old: version1.data.color,
          new: version2.data.color
        },
        metadata: {
          changed: JSON.stringify(version1.data.metadata) !== JSON.stringify(version2.data.metadata),
          old: version1.data.metadata,
          new: version2.data.metadata
        }
      };

      const hasChanges = Object.values(changes).some(change => change.changed);

      return {
        success: true,
        version1: {
          id: version1.id,
          timestamp: version1.timestamp,
          changeType: version1.changeType
        },
        version2: {
          id: version2.id,
          timestamp: version2.timestamp,
          changeType: version2.changeType
        },
        changes,
        hasChanges,
        timeDiff: Math.abs(version2.timestamp - version1.timestamp)
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get version statistics
  getVersionStats(noteId = null) {
    try {
      const history = this.getAllHistory();
      
      if (noteId) {
        // Stats for specific note
        const noteHistory = history.find(h => h.noteId === noteId);
        if (!noteHistory) return null;

        const versions = noteHistory.versions;
        const changeTypes = versions.reduce((acc, v) => {
          acc[v.changeType] = (acc[v.changeType] || 0) + 1;
          return acc;
        }, {});

        return {
          noteId,
          totalVersions: versions.length,
          firstVersion: versions[versions.length - 1]?.timestamp,
          lastVersion: versions[0]?.timestamp,
          changeTypes,
          averageTimeBetweenVersions: this.calculateAverageTimeBetweenVersions(versions)
        };
      } else {
        // Overall stats
        const totalVersions = history.reduce((sum, h) => sum + h.versions.length, 0);
        const totalNotes = history.length;
        const changeTypes = history.reduce((acc, h) => {
          h.versions.forEach(v => {
            acc[v.changeType] = (acc[v.changeType] || 0) + 1;
          });
          return acc;
        }, {});

        return {
          totalNotes,
          totalVersions,
          changeTypes,
          averageVersionsPerNote: totalNotes > 0 ? totalVersions / totalNotes : 0
        };
      }
    } catch (error) {
      console.error('Error getting version stats:', error);
      return null;
    }
  }

  // Calculate average time between versions
  calculateAverageTimeBetweenVersions(versions) {
    if (versions.length < 2) return 0;

    let totalTime = 0;
    for (let i = 0; i < versions.length - 1; i++) {
      totalTime += Math.abs(versions[i].timestamp - versions[i + 1].timestamp);
    }

    return totalTime / (versions.length - 1);
  }

  // Export version history
  exportVersionHistory(noteId, format = 'json') {
    try {
      const history = noteId ? this.getNoteHistory(noteId) : this.getAllHistory();
      
      let content, fileName, mimeType;

      if (format === 'json') {
        content = JSON.stringify(history, null, 2);
        fileName = `luv_notes_version_history_${noteId || 'all'}_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (format === 'txt') {
        content = this.formatVersionHistoryAsText(history, noteId);
        fileName = `luv_notes_version_history_${noteId || 'all'}_${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        success: true,
        fileName,
        format,
        versionCount: Array.isArray(history) ? history.length : history.versions?.length || 0
      };
    } catch (error) {
      console.error('Version history export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Format version history as text
  formatVersionHistoryAsText(history, noteId) {
    let text = `Luv Notes Version History Report\n`;
    text += `==================================\n\n`;

    if (noteId) {
      // Single note history
      text += `Note ID: ${noteId}\n`;
      text += `Total Versions: ${history.length}\n\n`;
      
      text += `Version Timeline:\n`;
      text += `=================\n`;
      
      history.forEach((version, index) => {
        text += `${index + 1}. ${new Date(version.timestamp).toLocaleString()}\n`;
        text += `   Type: ${version.changeType}\n`;
        text += `   Description: ${version.changeDescription || 'No description'}\n`;
        text += `   Version ID: ${version.id}\n\n`;
      });
    } else {
      // All notes history
      text += `Total Notes: ${history.length}\n`;
      text += `Total Versions: ${history.reduce((sum, h) => sum + h.versions.length, 0)}\n\n`;
      
      history.forEach((noteHistory, index) => {
        text += `Note ${index + 1}: ${noteHistory.noteId}\n`;
        text += `Versions: ${noteHistory.versions.length}\n`;
        text += `Created: ${new Date(noteHistory.createdAt).toLocaleString()}\n`;
        text += `Last Modified: ${new Date(noteHistory.lastModified).toLocaleString()}\n\n`;
      });
    }

    text += `Report Generated: ${new Date().toLocaleString()}\n`;
    return text;
  }

  // Clean up old versions for a note
  cleanupOldVersions(noteId) {
    try {
      const history = this.getAllHistory();
      const noteHistory = history.find(h => h.noteId === noteId);
      
      if (noteHistory && noteHistory.versions.length > this.maxVersionsPerNote) {
        noteHistory.versions = noteHistory.versions.slice(0, this.maxVersionsPerNote);
        localStorage.setItem(this.historyKey, JSON.stringify(history));
        
        console.log(`Cleaned up old versions for note ${noteId}, keeping ${this.maxVersionsPerNote} latest`);
      }
    } catch (error) {
      console.error('Error cleaning up old versions:', error);
    }
  }

  // Delete version history for a note
  deleteNoteHistory(noteId) {
    try {
      const history = this.getAllHistory();
      const filteredHistory = history.filter(h => h.noteId !== noteId);
      
      localStorage.setItem(this.historyKey, JSON.stringify(filteredHistory));
      console.log(`Version history deleted for note ${noteId}`);
      
      return {
        success: true,
        deletedNoteId: noteId
      };
    } catch (error) {
      console.error('Error deleting note history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear all version history
  clearAllHistory() {
    try {
      localStorage.removeItem(this.historyKey);
      console.log('All version history cleared');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error clearing version history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update settings
  updateSettings(settings) {
    if (settings.autoSaveEnabled !== undefined) {
      this.autoSaveEnabled = settings.autoSaveEnabled;
    }
    if (settings.autoSaveIntervalMs !== undefined) {
      this.autoSaveIntervalMs = settings.autoSaveIntervalMs;
    }
    if (settings.maxVersionsPerNote !== undefined) {
      this.maxVersionsPerNote = settings.maxVersionsPerNote;
    }

    this.saveSettings();
    
    if (this.autoSaveEnabled) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
  }

  // Generate unique version ID
  generateVersionId() {
    return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('luv_notes_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('luv_notes_session_id', sessionId);
    }
    return sessionId;
  }

  // Get readable time difference
  getTimeDifference(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}

export default VersionHistoryService;
