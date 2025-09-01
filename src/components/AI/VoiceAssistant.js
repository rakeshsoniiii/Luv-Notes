import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import "./VoiceAssistant.css";

const VoiceAssistant = ({
  content,
  onContentChange,
  onSpeechResult,
  className = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    // Check for Speech Recognition support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);

    // Check for Text-to-Speech support
    setTtsSupported("speechSynthesis" in window);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(interimTranscript);

        if (finalTranscript) {
          const newContent = content + " " + finalTranscript;
          onContentChange(newContent);
          if (onSpeechResult) {
            onSpeechResult(finalTranscript);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [content, onContentChange, onSpeechResult]);

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true);
      recognitionRef.current.start();
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

  const speakText = (text) => {
    if (!ttsSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      // Remove HTML tags for better speech
      const textToSpeak = content.replace(/<[^>]*>/g, "");
      speakText(textToSpeak);
    }
  };

  if (!speechSupported && !ttsSupported) {
    return null;
  }

  return (
    <div className={`voice-assistant ${className}`}>
      <div className="voice-controls">
        {speechSupported && (
          <div className="voice-control-group">
            <button
              className={`voice-btn speech-to-text ${
                isListening ? "active" : ""
              }`}
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Start voice input"}
              disabled={isSpeaking}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              <span className="voice-btn-text">
                {isListening ? "Stop" : "Speak"}
              </span>
            </button>
            {isListening && (
              <div className="listening-indicator">
                <div className="pulse-dot"></div>
                <span>Listening...</span>
              </div>
            )}
            {transcript && (
              <div className="transcript-preview">
                <span className="transcript-text">{transcript}</span>
              </div>
            )}
          </div>
        )}

        {ttsSupported && content && (
          <div className="voice-control-group">
            <button
              className={`voice-btn text-to-speech ${
                isSpeaking ? "active" : ""
              }`}
              onClick={toggleSpeaking}
              title={isSpeaking ? "Stop reading" : "Read note aloud"}
              disabled={isListening}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span className="voice-btn-text">
                {isSpeaking ? "Stop" : "Read"}
              </span>
            </button>
            {isSpeaking && (
              <div className="speaking-indicator">
                <div className="sound-wave">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
                <span>Reading...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {!speechSupported && !ttsSupported && (
        <div className="voice-not-supported">
          <p>Voice features not supported in this browser</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
