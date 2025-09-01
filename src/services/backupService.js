class BackupService {
  constructor() {
    this.backupInterval = null;
    this.lastBackupTime = null;
    this.backupKey = 'luv_notes_backup';
    this.versionKey = 'luv_notes_version';
    this.maxBackups = 10; // Keep last 10 backups
    this.autoBackupEnabled = true;
    this.backupIntervalMs = 5 * 60 * 1000; // 5 minutes
  }

  // Initialize automatic backups
  init() {
    this.loadSettings();
    this.startAutoBackup();
    this.loadLastBackupTime();
  }

  // Load backup settings from localStorage
  loadSettings() {
    try {
      const settings = localStorage.getItem('luv_notes_backup_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.autoBackupEnabled = parsed.autoBackupEnabled !== false;
        this.backupIntervalMs = parsed.backupIntervalMs || this.backupIntervalMs;
        this.maxBackups = parsed.maxBackups || this.maxBackups;
      }
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  }

  // Save backup settings to localStorage
  saveSettings() {
    try {
      const settings = {
        autoBackupEnabled: this.autoBackupEnabled,
        backupIntervalMs: this.backupIntervalMs,
        maxBackups: this.maxBackups
      };
      localStorage.setItem('luv_notes_backup_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving backup settings:', error);
    }
  }

  // Start automatic backup timer
  startAutoBackup() {
    if (!this.autoBackupEnabled) return;

    this.stopAutoBackup();
    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, this.backupIntervalMs);

    console.log(`Auto backup started with ${this.backupIntervalMs / 1000}s interval`);
  }

  // Stop automatic backup timer
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  // Create a backup of all notes
  async createBackup(notes, userId = 'anonymous') {
    try {
      const backupData = {
        id: this.generateBackupId(),
        timestamp: Date.now(),
        userId,
        notes: notes || [],
        version: this.getAppVersion(),
        metadata: {
          noteCount: notes ? notes.length : 0,
          totalSize: this.calculateDataSize(notes),
          backupType: 'automatic'
        }
      };

      // Save backup to localStorage
      this.saveBackup(backupData);

      // Update last backup time
      this.lastBackupTime = Date.now();
      this.saveLastBackupTime();

      // Clean up old backups
      this.cleanupOldBackups();

      console.log(`Backup created: ${backupData.id} with ${backupData.metadata.noteCount} notes`);
      
      return {
        success: true,
        backupId: backupData.id,
        timestamp: backupData.timestamp,
        noteCount: backupData.metadata.noteCount
      };
    } catch (error) {
      console.error('Backup creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create manual backup
  async createManualBackup(notes, userId = 'anonymous') {
    try {
      const backupData = {
        id: this.generateBackupId(),
        timestamp: Date.now(),
        userId,
        notes: notes || [],
        version: this.getAppVersion(),
        metadata: {
          noteCount: notes ? notes.length : 0,
          totalSize: this.calculateDataSize(notes),
          backupType: 'manual'
        }
      };

      // Save backup to localStorage
      this.saveBackup(backupData);

      // Update last backup time
      this.lastBackupTime = Date.now();
      this.saveLastBackupTime();

      console.log(`Manual backup created: ${backupData.id}`);
      
      return {
        success: true,
        backupId: backupData.id,
        timestamp: backupData.timestamp,
        noteCount: backupData.metadata.noteCount
      };
    } catch (error) {
      console.error('Manual backup creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save backup to localStorage
  saveBackup(backupData) {
    try {
      const backups = this.getAllBackups();
      backups.push(backupData);
      
      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp - a.timestamp);
      
      localStorage.setItem(this.backupKey, JSON.stringify(backups));
    } catch (error) {
      console.error('Error saving backup:', error);
      throw error;
    }
  }

  // Get all backups
  getAllBackups() {
    try {
      const backups = localStorage.getItem(this.backupKey);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error('Error loading backups:', error);
      return [];
    }
  }

  // Get backup by ID
  getBackup(backupId) {
    try {
      const backups = this.getAllBackups();
      return backups.find(backup => backup.id === backupId);
    } catch (error) {
      console.error('Error getting backup:', error);
      return null;
    }
  }

  // Get latest backup
  getLatestBackup() {
    try {
      const backups = this.getAllBackups();
      return backups.length > 0 ? backups[0] : null;
    } catch (error) {
      console.error('Error getting latest backup:', error);
      return null;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId) {
    try {
      const backup = this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      console.log(`Restoring from backup: ${backupId}`);
      
      return {
        success: true,
        backup,
        notes: backup.notes,
        timestamp: backup.timestamp
      };
    } catch (error) {
      console.error('Backup restoration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export backup to file
  exportBackup(backupId, format = 'json') {
    try {
      const backup = this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      let content, fileName, mimeType;

      if (format === 'json') {
        content = JSON.stringify(backup, null, 2);
        fileName = `luv_notes_backup_${backupId}_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (format === 'txt') {
        content = this.formatBackupAsText(backup);
        fileName = `luv_notes_backup_${backupId}_${new Date(backup.timestamp).toISOString().split('T')[0]}.txt`;
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
        format
      };
    } catch (error) {
      console.error('Backup export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Import backup from file
  async importBackup(file) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const backupData = JSON.parse(e.target.result);
            
            // Validate backup data
            if (!this.validateBackupData(backupData)) {
              reject(new Error('Invalid backup file format'));
              return;
            }

            // Save imported backup
            this.saveBackup(backupData);
            
            resolve({
              success: true,
              backupId: backupData.id,
              timestamp: backupData.timestamp,
              noteCount: backupData.metadata.noteCount
            });
          } catch (error) {
            reject(new Error('Failed to parse backup file'));
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Backup import failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate backup data
  validateBackupData(data) {
    return data && 
           data.id && 
           data.timestamp && 
           Array.isArray(data.notes) && 
           data.version && 
           data.metadata;
  }

  // Clean up old backups
  cleanupOldBackups() {
    try {
      const backups = this.getAllBackups();
      if (backups.length > this.maxBackups) {
        const backupsToKeep = backups.slice(0, this.maxBackups);
        localStorage.setItem(this.backupKey, JSON.stringify(backupsToKeep));
        console.log(`Cleaned up ${backups.length - backupsToKeep.length} old backups`);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  // Get backup statistics
  getBackupStats() {
    try {
      const backups = this.getAllBackups();
      const totalSize = backups.reduce((sum, backup) => sum + backup.metadata.totalSize, 0);
      
      return {
        totalBackups: backups.length,
        totalSize,
        lastBackup: this.lastBackupTime,
        autoBackupEnabled: this.autoBackupEnabled,
        nextBackupIn: this.getNextBackupTime()
      };
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return null;
    }
  }

  // Get next backup time
  getNextBackupTime() {
    if (!this.autoBackupEnabled || !this.lastBackupTime) return null;
    return this.lastBackupTime + this.backupIntervalMs;
  }

  // Update backup settings
  updateSettings(settings) {
    if (settings.autoBackupEnabled !== undefined) {
      this.autoBackupEnabled = settings.autoBackupEnabled;
    }
    if (settings.backupIntervalMs !== undefined) {
      this.backupIntervalMs = settings.backupIntervalMs;
    }
    if (settings.maxBackups !== undefined) {
      this.maxBackups = settings.maxBackups;
    }

    this.saveSettings();
    
    if (this.autoBackupEnabled) {
      this.startAutoBackup();
    } else {
      this.stopAutoBackup();
    }
  }

  // Load last backup time
  loadLastBackupTime() {
    try {
      const lastBackup = localStorage.getItem('luv_notes_last_backup');
      this.lastBackupTime = lastBackup ? parseInt(lastBackup) : null;
    } catch (error) {
      console.error('Error loading last backup time:', error);
      this.lastBackupTime = null;
    }
  }

  // Save last backup time
  saveLastBackupTime() {
    try {
      localStorage.setItem('luv_notes_last_backup', this.lastBackupTime.toString());
    } catch (error) {
      console.error('Error saving last backup time:', error);
    }
  }

  // Generate unique backup ID
  generateBackupId() {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get app version
  getAppVersion() {
    return '1.0.0'; // You can update this to match your package.json version
  }

  // Calculate data size
  calculateDataSize(notes) {
    if (!notes) return 0;
    return JSON.stringify(notes).length;
  }

  // Format backup as text
  formatBackupAsText(backup) {
    let text = `Luv Notes Backup Report\n`;
    text += `========================\n\n`;
    text += `Backup ID: ${backup.id}\n`;
    text += `Created: ${new Date(backup.timestamp).toLocaleString()}\n`;
    text += `User ID: ${backup.userId}\n`;
    text += `Version: ${backup.version}\n`;
    text += `Note Count: ${backup.metadata.noteCount}\n`;
    text += `Total Size: ${backup.metadata.totalSize} characters\n\n`;
    
    text += `Notes:\n`;
    text += `------\n`;
    
    backup.notes.forEach((note, index) => {
      text += `${index + 1}. ${note.title || 'Untitled'}\n`;
      text += `   Created: ${new Date(note.createdAt || Date.now()).toLocaleString()}\n`;
      text += `   Modified: ${new Date(note.updatedAt || Date.now()).toLocaleString()}\n`;
      text += `   Content: ${(note.content || '').substring(0, 100)}${(note.content || '').length > 100 ? '...' : ''}\n\n`;
    });
    
    return text;
  }

  // Delete backup
  deleteBackup(backupId) {
    try {
      const backups = this.getAllBackups();
      const filteredBackups = backups.filter(backup => backup.id !== backupId);
      
      if (filteredBackups.length === backups.length) {
        throw new Error('Backup not found');
      }
      
      localStorage.setItem(this.backupKey, JSON.stringify(filteredBackups));
      console.log(`Backup deleted: ${backupId}`);
      
      return {
        success: true,
        deletedBackupId: backupId
      };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear all backups
  clearAllBackups() {
    try {
      localStorage.removeItem(this.backupKey);
      localStorage.removeItem('luv_notes_last_backup');
      this.lastBackupTime = null;
      console.log('All backups cleared');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error clearing backups:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default BackupService;
