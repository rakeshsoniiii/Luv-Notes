import React, { useState, useRef } from "react";
import { Camera, Upload, X, Loader, FileImage, Zap } from "lucide-react";
import { useNotesContext } from "../../contexts/FirebaseNotesContext";
import toast from "react-hot-toast";
import "./ImageNoteCreator.css";

const ImageNoteCreator = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [title, setTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { addNote } = useNotesContext();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      processImageFile(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const processImageFile = (file) => {
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Extract text from image (mock implementation)
    extractTextFromImage(file);
  };

  const extractTextFromImage = async (file) => {
    setIsProcessing(true);

    try {
      // Use Tesseract.js for real OCR functionality
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      if (text.trim()) {
        setExtractedText(text.trim());
        
        // Auto-generate title from first meaningful line
        const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
        const firstLine = lines[0] || 'Extracted Text';
        setTitle(
          firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine
        );
        
        toast.success("Text extracted from image successfully!");
      } else {
        // Fallback if no text detected
        setExtractedText("No text detected in the image. You can still add your own notes here.");
        setTitle("Image Note");
        toast.info("No text detected, but you can add your own notes!");
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      
      // Fallback to manual input if OCR fails
      setExtractedText("OCR failed. Please type your notes manually or try a clearer image.");
      setTitle("Manual Note");
      toast.error("Text extraction failed. You can type manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          processImageFile(file);
          stopCamera();
        },
        "image/jpeg",
        0.8
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const handleSaveNote = async () => {
    if (!extractedText.trim()) {
      toast.error("No text extracted from image");
      return;
    }

    try {
      await addNote(title || "Note from Image", extractedText);
      toast.success("Note created from image!");
      onClose();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="image-note-overlay">
      <div className="image-note-modal">
        <div className="image-note-header">
          <div className="header-title">
            <FileImage size={20} />
            <h3>Create Note from Image</h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="image-note-content">
          {!selectedImage && !showCamera && (
            <div className="upload-options">
              <div className="upload-section">
                <h4>Choose an option to get started:</h4>

                <div className="upload-buttons">
                  <button
                    className="upload-btn camera-btn"
                    onClick={startCamera}
                  >
                    <Camera size={24} />
                    <span>Take Photo</span>
                    <small>Use your camera</small>
                  </button>

                  <button
                    className="upload-btn file-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={24} />
                    <span>Upload Image</span>
                    <small>From your device</small>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                <div className="upload-info">
                  <p>📸 Supported formats: JPG, PNG, GIF, WebP</p>
                  <p>🤖 AI will extract text from your image automatically</p>
                </div>
              </div>
            </div>
          )}

          {showCamera && (
            <div className="camera-section">
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>

              <div className="camera-controls">
                <button
                  className="camera-control-btn cancel"
                  onClick={stopCamera}
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  className="camera-control-btn capture"
                  onClick={capturePhoto}
                >
                  <Camera size={20} />
                  Capture
                </button>
              </div>
            </div>
          )}

          {selectedImage && (
            <div className="image-processing-section">
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="preview-image"
                />
                <button
                  className="change-image-btn"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setExtractedText("");
                    setTitle("");
                  }}
                >
                  <Upload size={16} />
                  Change Image
                </button>
              </div>

              {isProcessing && (
                <div className="processing-status">
                  <Loader className="spinner" size={20} />
                  <p>Extracting text from image...</p>
                </div>
              )}

              {extractedText && !isProcessing && (
                <div className="extracted-content">
                  <div className="content-header">
                    <Zap size={16} />
                    <span>Extracted Text</span>
                  </div>

                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title..."
                      className="title-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Content:</label>
                    <textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      placeholder="Extracted text will appear here..."
                      className="content-textarea"
                      rows={8}
                    />
                  </div>

                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={handleClose}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSaveNote}>
                      <FileImage size={16} />
                      Save Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageNoteCreator;
