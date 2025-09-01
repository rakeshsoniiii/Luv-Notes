import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNotesContext } from "../../contexts/FirebaseNotesContext";
import RichTextEditor from "../TextEditor/RichTextEditor";
import AIToolbar from "../AI/AIToolbar";
import "./Notes.css";

const CreateNote = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { addNote } = useNotesContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() || content.trim()) {
      await addNote(title, content);
      setTitle("");
      setContent("");
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div
        className="create-note-collapsed"
        onClick={() => setIsExpanded(true)}
      >
        <Plus size={20} />
        <span>Take a note...</span>
      </div>
    );
  }

  return (
    <div className="create-note-expanded">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="create-note-title"
          autoFocus
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
        <div className="create-note-actions">
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNote;
