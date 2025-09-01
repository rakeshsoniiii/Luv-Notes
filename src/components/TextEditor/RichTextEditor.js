import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Link
} from 'lucide-react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Take a note..." }) => {
  const editorRef = useRef(null);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedSize, setSelectedSize] = useState('14');
  const [selectedColor] = useState('#000000');

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino'
  ];

  const sizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36'];

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc',
    '#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#0066ff',
    '#6600ff', '#ff0066', '#8b4513', '#2e8b57', '#4682b4'
  ];

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFontChange = (font) => {
    setSelectedFont(font);
    execCommand('fontName', font);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    execCommand('fontSize', '3');
    // Apply custom size via CSS
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size + 'px';
      try {
        range.surroundContents(span);
      } catch (e) {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
    }
    handleContentChange();
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    execCommand('foreColor', color);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <select 
            value={selectedFont} 
            onChange={(e) => handleFontChange(e.target.value)}
            className="font-select"
          >
            {fonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedSize} 
            onChange={(e) => handleSizeChange(e.target.value)}
            className="size-select"
          >
            {sizes.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="toolbar-btn"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="toolbar-btn"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="toolbar-btn"
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('justifyLeft')}
            className="toolbar-btn"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('justifyCenter')}
            className="toolbar-btn"
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('justifyRight')}
            className="toolbar-btn"
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="toolbar-btn"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="toolbar-btn"
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <div className="color-picker-group">
            <Palette size={16} />
            <div className="color-options">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  className="color-btn"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>
          
          <button
            type="button"
            onClick={insertLink}
            className="toolbar-btn"
            title="Insert Link"
          >
            <Link size={16} />
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="editor-content"
        onInput={handleContentChange}
        onBlur={handleContentChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default RichTextEditor;