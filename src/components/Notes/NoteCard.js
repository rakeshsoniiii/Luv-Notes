import React, { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, Palette, Edit3, Archive, EyeOff, Download, History, Save } from "lucide-react";
import { useNotesContext } from "../../contexts/FirebaseNotesContext";
import RichTextEditor from "../TextEditor/RichTextEditor";
import AIToolbar from "../AI/AIToolbar";
import ExportNotes from "./ExportNotes";
import BackupManager from "./BackupManager";
import VersionHistory from "./VersionHistory";
import "./Notes.css";

const colors = [
  "#ffffff",
  "#ffe0e6", // Love light
  "#ffc1cc", // Love accent
  "#ff8fab", // Love secondary
  "#ff6b9d", // Love primary
  "#fce4ec", // Rose light
  "#f8bbd9", // Rose accent
  "#f06292", // Rose secondary
  "#e91e63", // Rose primary
  "#e1bee7", // Purple accent
  "#ba68c8", // Purple secondary
  "#9c27b0", // Purple primary
  "#fbe9e7", // Sunset light
  "#ffab91", // Sunset accent
  "#ff7043", // Sunset secondary
  "#ff5722", // Sunset primary
];

const NoteCard = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const { updateNote, deleteNote, archiveNote, addHiddenNote } = useNotesContext();
  const titleRef = useRef(null);
  const noteCardRef = useRef(null);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (title !== note.title || content !== note.content) {
      await updateNote(note.id, { title, content });
    }
  }, [title, content, note.title, note.content, note.id, updateNote]);

  // Auto-save when title or content changes
  useEffect(() => {
    if (isEditing) {
      const saveTimer = setTimeout(() => {
        autoSave();
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [title, content, isEditing, autoSave]);

  // Focus on title when editing starts
  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isEditing]);

  // Handle click outside to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noteCardRef.current && !noteCardRef.current.contains(event.target)) {
        if (isEditing) {
          autoSave(); // Save before exiting
          setIsEditing(false);
        }
        setShowColorPicker(false);
      }
    };

    if (isEditing || showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing, showColorPicker, autoSave]);

  const handleExitEdit = async () => {
    await autoSave();
    setIsEditing(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleColorChange = async (color) => {
    await updateNote(note.id, { color });
    setShowColorPicker(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      await deleteNote(note.id);
    }
  };

  const handleArchive = async () => {
    if (window.confirm("Are you sure you want to archive this note?")) {
      await archiveNote(note.id);
    }
  };

  const handleHideNote = async () => {
    if (window.confirm("Are you sure you want to hide this note? It will be moved to hidden notes and require a password to access.")) {
      try {
        await addHiddenNote(note.title, note.content);
        await deleteNote(note.id);
      } catch (error) {
        console.error("Error hiding note:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleExitEdit();
    }
  };

  return (
    <div
      ref={noteCardRef}
      className="note-card"
      style={{ backgroundColor: note.color }}
    >
      {isEditing ? (
        <div className="note-editing">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="note-title-input"
            placeholder="Note title..."
          />
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Take a note..."
          />
          <AIToolbar
            content={content}
            onContentChange={setContent}
            onTitleChange={setTitle}
            title={title}
          />
        </div>
      ) : (
        <div
          className="note-display"
          onClick={handleEdit}
          style={{ cursor: "pointer" }}
          title="Click to edit note"
        >
          <h3 className="note-title">{note.title || "Untitled"}</h3>
          <div
            className="note-content"
            dangerouslySetInnerHTML={{ __html: note.content || "" }}
          />
        </div>
      )}

      <div className="note-actions">
        {!isEditing && (
          <button
            className="note-action-btn edit-btn"
            onClick={handleEdit}
            title="Edit note"
          >
            <Edit3 size={16} />
          </button>
        )}

        <button
          className="note-action-btn export-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowExport(true);
          }}
          title="Export note"
        >
          <Download size={16} />
        </button>

        <button
          className="note-action-btn version-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowVersionHistory(true);
          }}
          title="Version history"
        >
          <History size={16} />
        </button>

        <div className="color-picker-container">
          <button
            className="note-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            title="Change color"
          >
            <Palette size={16} />
          </button>
          {showColorPicker && (
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange(color);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          className="note-action-btn hide-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleHideNote();
          }}
          title="Hide note (requires password)"
        >
          <EyeOff size={16} />
        </button>

        <button
          className="note-action-btn archive-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleArchive();
          }}
          title="Archive note"
        >
          <Archive size={16} />
        </button>

        <button
          className="note-action-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          title="Delete note"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Export Modal */}
      <ExportNotes
        notes={[note]}
        onClose={() => setShowExport(false)}
        isVisible={showExport}
      />

      {/* Version History Modal */}
      <VersionHistory
        note={note}
        onClose={() => setShowVersionHistory(false)}
        isVisible={showVersionHistory}
        onRestore={(restoredNote) => {
          setTitle(restoredNote.title);
          setContent(restoredNote.content);
          updateNote(note.id, restoredNote);
          setShowVersionHistory(false);
        }}
      />
    </div>
  );
};

export default NoteCard;
