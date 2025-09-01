import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Lightbulb, 
  Target, 
  Tag, 
  Wand2,
  Loader,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import geminiService from '../../services/geminiService';
import VoiceAssistant from './VoiceAssistant';
import toast from 'react-hot-toast';
import './AIToolbar.css';

const AIToolbar = ({ content, onContentChange, onTitleChange, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState({});

  const handleAIAction = async (action, actionName) => {
    if (!content || content.trim() === '') {
      toast.error('Please add some content first');
      return;
    }

    setLoading(prev => ({ ...prev, [actionName]: true }));
    
    try {
      const result = await action(content);
      return result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };

  const summarizeNote = async () => {
    const summary = await handleAIAction(
      geminiService.summarizeNote.bind(geminiService),
      'summarize'
    );
    if (summary) {
      onContentChange(`<div><strong>📝 Summary:</strong></div><div>${summary}</div><br/><div><strong>📄 Original Content:</strong></div><div>${content}</div>`);
      toast.success('Note summarized!');
    }
  };

  const generateTitle = async () => {
    const newTitle = await handleAIAction(
      geminiService.generateTitle.bind(geminiService),
      'title'
    );
    if (newTitle) {
      onTitleChange(newTitle);
      toast.success('Title generated!');
    }
  };

  const enhanceNote = async () => {
    const enhanced = await handleAIAction(
      geminiService.enhanceNote.bind(geminiService),
      'enhance'
    );
    if (enhanced) {
      onContentChange(enhanced);
      toast.success('Note enhanced!');
    }
  };

  const extractKeyPoints = async () => {
    const keyPoints = await handleAIAction(
      geminiService.extractKeyPoints.bind(geminiService),
      'keypoints'
    );
    if (keyPoints) {
      onContentChange(`<div><strong>🎯 Key Points:</strong></div><div>${keyPoints}</div><br/><div><strong>📄 Original Content:</strong></div><div>${content}</div>`);
      toast.success('Key points extracted!');
    }
  };

  const generateTags = async () => {
    const tags = await handleAIAction(
      geminiService.generateTags.bind(geminiService),
      'tags'
    );
    if (tags && tags.length > 0) {
      const tagsHtml = tags.map(tag => `<span class="ai-tag">#${tag}</span>`).join(' ');
      onContentChange(`${content}<br/><div><strong>🏷️ Tags:</strong> ${tagsHtml}</div>`);
      toast.success('Tags generated!');
    }
  };

  const aiActions = [
    {
      id: 'summarize',
      icon: FileText,
      label: 'Summarize',
      action: summarizeNote,
      description: 'Create a concise summary'
    },
    {
      id: 'title',
      icon: Lightbulb,
      label: 'Smart Title',
      action: generateTitle,
      description: 'Generate a smart title'
    },
    {
      id: 'enhance',
      icon: Wand2,
      label: 'Enhance',
      action: enhanceNote,
      description: 'Improve and organize content'
    },
    {
      id: 'keypoints',
      icon: Target,
      label: 'Key Points',
      action: extractKeyPoints,
      description: 'Extract main points'
    },
    {
      id: 'tags',
      icon: Tag,
      label: 'Generate Tags',
      action: generateTags,
      description: 'Add relevant tags'
    }
  ];

  return (
    <div className="ai-toolbar">
      <button
        className="ai-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        title="AI Assistant"
      >
        <Sparkles size={16} />
        <span>AI Assistant</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="ai-actions">
          <div className="ai-actions-grid">
            {aiActions.map(({ id, icon: Icon, label, action, description }) => (
              <button
                key={id}
                className="ai-action-btn"
                onClick={action}
                disabled={loading[id]}
                title={description}
              >
                {loading[id] ? (
                  <Loader size={16} className="spinning" />
                ) : (
                  <Icon size={16} />
                )}
                <span>{label}</span>
              </button>
            ))}
          </div>
          
          <VoiceAssistant
            content={content}
            onContentChange={onContentChange}
            onSpeechResult={() => {
              toast.success('Voice input added!');
            }}
          />
          
          <div className="ai-info">
            <p>✨ Powered by Google Gemini AI</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIToolbar;