import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Save, X, Sparkles } from 'lucide-react';
import { useNotesContext } from '../../contexts/FirebaseNotesContext';
import geminiService from '../../services/geminiService';
import toast from 'react-hot-toast';
import './VoiceNoteCreator.css';

const VoiceNoteCreator = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addNote } = useNotesContext();
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        setTranscript(interim);
        if (final) {
          setFinalTranscript(prev => prev + ' ' + final);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
      toast.success('Start speaking...');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const saveVoiceNote = async () => {
    const fullContent = finalTranscript.trim();
    if (!fullContent) {
      toast.error('No content to save');
      return;
    }

    setIsProcessing(true);
    try {
      // Generate AI title for the voice note
      const aiTitle = await geminiService.generateTitle(fullContent);
      await addNote(aiTitle || 'Voice Note', fullContent);
      toast.success('Voice note saved!');
      onClose();
    } catch (error) {
      console.error('Error saving voice note:', error);
      // Fallback: save without AI title
      await addNote('Voice Note', fullContent);
      toast.success('Voice note saved!');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const enhanceWithAI = async () => {
    const fullContent = finalTranscript.trim();
    if (!fullContent) {
      toast.error('No content to enhance');
      return;
    }

    setIsProcessing(true);
    try {
      const enhanced = await geminiService.enhanceNote(fullContent);
      const aiTitle = await geminiService.generateTitle(enhanced);
      await addNote(aiTitle || 'Enhanced Voice Note', enhanced);
      toast.success('Voice note enhanced and saved!');
      onClose();
    } catch (error) {
      console.error('Error enhancing voice note:', error);
      toast.error('Failed to enhance note. Saving original...');
      await addNote('Voice Note', fullContent);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const fullText = finalTranscript + ' ' + transcript;

  return (
    <div className="voice-note-creator-overlay">
      <div className="voice-note-creator">
        <div className="voice-note-header">
          <h3>🎤 Voice Note</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="voice-note-content">
          <div className="voice-controls-main">
            <button
              className={`voice-record-btn ${isListening ? 'recording' : ''}`}
              onClick={toggleListening}
              disabled={isProcessing}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              <span>{isListening ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
          </div>

          {isListening && (
            <div className="recording-indicator">
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay-1"></div>
              <div className="pulse-ring delay-2"></div>
              <span>Listening...</span>
            </div>
          )}

          <div className="transcript-display">
            <div className="transcript-final">
              {finalTranscript}
            </div>
            {transcript && (
              <div className="transcript-interim">
                {transcript}
              </div>
            )}
            {!fullText.trim() && (
              <div className="transcript-placeholder">
                Your speech will appear here...
              </div>
            )}
          </div>

          <div className="voice-note-actions">
            <button
              className="action-btn cancel-btn"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            
            {fullText.trim() && (
              <>
                <button
                  className="action-btn enhance-btn"
                  onClick={enhanceWithAI}
                  disabled={isProcessing || isListening}
                >
                  {isProcessing ? (
                    <>
                      <Sparkles size={16} className="spinning" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Enhance & Save
                    </>
                  )}
                </button>
                
                <button
                  className="action-btn save-btn"
                  onClick={saveVoiceNote}
                  disabled={isProcessing || isListening}
                >
                  <Save size={16} />
                  Save Note
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceNoteCreator;