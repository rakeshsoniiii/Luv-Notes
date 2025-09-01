import React, { useState } from 'react';
import { Download, FileText, FileImage, Users, Settings, X } from 'lucide-react';
import ExportService from '../../services/exportService';
import { useTheme } from '../../contexts/ThemeContext';
import './ExportNotes.css';

const ExportNotes = ({ notes, onClose, isVisible }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportType, setExportType] = useState('single'); // 'single' or 'multiple'
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const { isDark } = useTheme();

  // Handle note selection for multiple export
  const handleNoteSelection = (noteId, checked) => {
    if (checked) {
      setSelectedNotes(prev => [...prev, noteId]);
    } else {
      setSelectedNotes(prev => prev.filter(id => id !== noteId));
    }
  };

  // Select all notes
  const selectAllNotes = () => {
    setSelectedNotes(notes.map(note => note.id));
  };

  // Deselect all notes
  const deselectAllNotes = () => {
    setSelectedNotes([]);
  };

  // Export notes
  const handleExport = async () => {
    if (exportType === 'multiple' && selectedNotes.length === 0) {
      alert('Please select at least one note to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Preparing export...');

    try {
      let result;

      if (exportType === 'single') {
        // Single note export (first note or selected note)
        const noteToExport = selectedNotes.length > 0 
          ? notes.find(note => note.id === selectedNotes[0])
          : notes[0];

        if (!noteToExport) {
          throw new Error('No note to export');
        }

        setExportStatus('Exporting single note...');
        setExportProgress(30);

        if (exportFormat === 'pdf') {
          result = await ExportService.exportToPDF(noteToExport, isDark ? 'dark' : 'default');
        } else {
          result = await ExportService.exportToWord(noteToExport);
        }

        setExportProgress(100);
        setExportStatus('Export completed!');
      } else {
        // Multiple notes export
        const notesToExport = notes.filter(note => selectedNotes.includes(note.id));
        
        setExportStatus(`Exporting ${notesToExport.length} notes...`);
        setExportProgress(30);

        result = await ExportService.exportMultipleNotes(
          notesToExport, 
          exportFormat, 
          isDark ? 'dark' : 'default'
        );

        setExportProgress(100);
        setExportStatus(`Exported ${result.noteCount} notes successfully!`);
      }

      if (result.success) {
        // Show success message
        setTimeout(() => {
          setExportStatus(`✅ ${result.fileName} downloaded successfully!`);
        }, 1000);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(`❌ Export failed: ${error.message}`);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStatus('');
      }, 3000);
    }
  };

  // Get readable file size
  const getFileSize = (notes) => {
    const totalSize = notes.reduce((sum, note) => {
      return sum + (note.title?.length || 0) + (note.content?.length || 0);
    }, 0);
    
    if (totalSize < 1024) return `${totalSize} B`;
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
    return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isVisible) return null;

  return (
    <div className="export-overlay">
      <div className={`export-modal ${isDark ? 'dark' : ''}`}>
        <div className="export-header">
          <h2>Export Notes</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="export-content">
          {/* Export Type Selection */}
          <div className="export-section">
            <h3>Export Type</h3>
            <div className="export-options">
              <label className="export-option">
                <input
                  type="radio"
                  name="exportType"
                  value="single"
                  checked={exportType === 'single'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <div className="option-content">
                  <FileText size={20} />
                  <span>Single Note</span>
                  <small>Export one note at a time</small>
                </div>
              </label>

              <label className="export-option">
                <input
                  type="radio"
                  name="exportType"
                  value="multiple"
                  checked={exportType === 'multiple'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <div className="option-content">
                  <Users size={20} />
                  <span>Multiple Notes</span>
                  <small>Export multiple notes together</small>
                </div>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div className="export-section">
            <h3>Export Format</h3>
            <div className="format-options">
              <label className="format-option">
                <input
                  type="radio"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-content">
                  <FileImage size={20} />
                  <span>PDF</span>
                  <small>High quality, preserves formatting</small>
                </div>
              </label>

              <label className="format-option">
                <input
                  type="radio"
                  name="exportFormat"
                  value="word"
                  checked={exportFormat === 'word'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-content">
                  <FileText size={20} />
                  <span>Word Document</span>
                  <small>Editable, Microsoft Word compatible</small>
                </div>
              </label>
            </div>
          </div>

          {/* Note Selection for Multiple Export */}
          {exportType === 'multiple' && (
            <div className="export-section">
              <h3>Select Notes to Export</h3>
              <div className="note-selection-controls">
                <button 
                  type="button" 
                  className="select-btn"
                  onClick={selectAllNotes}
                >
                  Select All
                </button>
                <button 
                  type="button" 
                  className="select-btn"
                  onClick={deselectAllNotes}
                >
                  Deselect All
                </button>
                <span className="selection-info">
                  {selectedNotes.length} of {notes.length} notes selected
                </span>
              </div>
              
              <div className="notes-list">
                {notes.map(note => (
                  <label key={note.id} className="note-item">
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note.id)}
                      onChange={(e) => handleNoteSelection(note.id, e.target.checked)}
                    />
                    <div className="note-info">
                      <span className="note-title">{note.title || 'Untitled'}</span>
                      <span className="note-meta">
                        {new Date(note.createdAt || Date.now()).toLocaleDateString()} • 
                        {getFileSize([note])}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="export-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <p className="progress-status">{exportStatus}</p>
            </div>
          )}

          {/* Export Summary */}
          <div className="export-summary">
            <div className="summary-item">
              <span>Total Notes:</span>
              <span>{exportType === 'single' ? 1 : selectedNotes.length}</span>
            </div>
            <div className="summary-item">
              <span>Format:</span>
              <span>{exportFormat.toUpperCase()}</span>
            </div>
            <div className="summary-item">
              <span>Estimated Size:</span>
              <span>{getFileSize(exportType === 'single' ? [notes[0]] : notes.filter(note => selectedNotes.includes(note.id)))}</span>
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="export-btn" 
            onClick={handleExport}
            disabled={isExporting || (exportType === 'multiple' && selectedNotes.length === 0)}
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportNotes;
