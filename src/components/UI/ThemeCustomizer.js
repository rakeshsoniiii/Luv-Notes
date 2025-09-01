import React, { useState, useRef, useEffect, useCallback } from "react";
import { Heart, Palette, Sun, Moon, Move } from "lucide-react";
import HeartLogo from "./HeartLogo";
import "./ThemeCustomizer.css";

const ThemeCustomizer = ({
  currentTheme,
  onThemeChange,
  isDark,
  onToggleDark,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const panelRef = useRef(null);
  const dragThreshold = 5; // Minimum pixels to move before starting drag

  // When controlled externally, show panel immediately
  useEffect(() => {
    if (onClose) {
      setIsOpen(true);
    }
  }, [onClose]);

  // Determine if panel should be shown
  const shouldShowPanel = isOpen || onClose;

  // Reset position when panel opens
  useEffect(() => {
    if (shouldShowPanel) {
      setPosition({ x: 0, y: 0 });
    }
  }, [shouldShowPanel]);

  const loveThemes = [
    {
      id: "love-classic",
      name: "Classic Love",
      colors: ["#ff6b9d", "#ff8fab", "#ffc1cc"],
      description: "Sweet and romantic pink tones",
    },
    {
      id: "love-rose",
      name: "Romantic Rose",
      colors: ["#e91e63", "#f06292", "#f8bbd9"],
      description: "Deep rose and passionate pink",
    },
    {
      id: "love-sunset",
      name: "Sunset Love",
      colors: ["#ff5722", "#ff7043", "#ffab91"],
      description: "Warm sunset orange and coral",
    },
    {
      id: "love-purple",
      name: "Purple Love",
      colors: ["#9c27b0", "#ba68c8", "#e1bee7"],
      description: "Mystical purple and lavender",
    },
    {
      id: "love-coral",
      name: "Coral Love",
      colors: ["#ff7675", "#fd79a8", "#fdcb6e"],
      description: "Vibrant coral and peach",
    },
    {
      id: "love-rgb",
      name: "RGB Love",
      colors: ["#ff0000", "#00ff00", "#0000ff"],
      description: "Dynamic RGB color spectrum",
      isRgb: true,
    },
  ];

  const handleThemeSelect = (themeId) => {
    onThemeChange(`theme-${themeId}`);
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  // Enhanced backdrop click handler
  const handleBackdropClick = (e) => {
    // Only close if not dragging and clicking on backdrop
    if (!isDragging && !hasMoved && e.target === e.currentTarget) {
      if (onClose) {
        onClose();
      } else {
        setIsOpen(false);
      }
    }
  };

  // Enhanced drag functionality with better sensitivity
  const handleMouseDown = (e) => {
    if (e.target.closest(".close-btn") || e.target.closest(".theme-options")) {
      return; // Don't drag when clicking close button or theme options
    }

    const rect = panelRef.current.getBoundingClientRect();
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHasMoved(false);

    // Add temporary listeners for immediate response
    document.addEventListener("mousemove", handleMouseMoveTemp);
    document.addEventListener("mouseup", handleMouseUpTemp);
    e.preventDefault();
  };

  const handleMouseMoveTemp = (e) => {
    const deltaX = Math.abs(e.clientX - initialMousePos.x);
    const deltaY = Math.abs(e.clientY - initialMousePos.y);

    // Start dragging only after threshold is met
    if (!isDragging && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      setIsDragging(true);
      setHasMoved(true);
    }

    if (isDragging) {
      handleMouseMove(e);
    }
  };

  const handleMouseUpTemp = () => {
    document.removeEventListener("mousemove", handleMouseMoveTemp);
    document.removeEventListener("mouseup", handleMouseUpTemp);
    setIsDragging(false);
    // Don't reset hasMoved immediately to prevent backdrop click
    setTimeout(() => setHasMoved(false), 100);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !panelRef.current) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep panel within viewport bounds with padding
      const padding = 10;
      const maxX = window.innerWidth - panelRef.current.offsetWidth - padding;
      const maxY = window.innerHeight - panelRef.current.offsetHeight - padding;

      setPosition({
        x: Math.max(padding, Math.min(newX, maxX)),
        y: Math.max(padding, Math.min(newY, maxY)),
      });
    },
    [isDragging, dragStart.x, dragStart.y]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    // Don't reset hasMoved immediately to prevent backdrop click
    setTimeout(() => setHasMoved(false), 100);
  };

  // Enhanced touch events for mobile with better sensitivity
  const handleTouchStart = (e) => {
    if (e.target.closest(".close-btn") || e.target.closest(".theme-options")) {
      return;
    }

    const touch = e.touches[0];
    const rect = panelRef.current.getBoundingClientRect();

    setInitialMousePos({ x: touch.clientX, y: touch.clientY });
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setHasMoved(false);

    // Immediate touch response
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || !panelRef.current) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - initialMousePos.x);
      const deltaY = Math.abs(touch.clientY - initialMousePos.y);

      // More sensitive threshold for touch
      if (!hasMoved && (deltaX > 3 || deltaY > 3)) {
        setHasMoved(true);
      }

      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      // Keep panel within viewport bounds with padding
      const padding = 10;
      const maxX = window.innerWidth - panelRef.current.offsetWidth - padding;
      const maxY = window.innerHeight - panelRef.current.offsetHeight - padding;

      setPosition({
        x: Math.max(padding, Math.min(newX, maxX)),
        y: Math.max(padding, Math.min(newY, maxY)),
      });
      e.preventDefault();
    },
    [
      isDragging,
      dragStart.x,
      dragStart.y,
      initialMousePos.x,
      initialMousePos.y,
      hasMoved,
    ]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Don't reset hasMoved immediately to prevent backdrop click
    setTimeout(() => setHasMoved(false), 100);
  };

  // Add event listeners with better cleanup
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      // Prevent text selection while dragging
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);

        // Restore text selection
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

  // Handle click outside and keyboard events
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !isDragging &&
        !hasMoved
      ) {
        if (onClose) {
          onClose();
        } else {
          setIsOpen(false);
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        if (onClose) {
          onClose();
        } else {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen, isDragging, hasMoved]);

  return (
    <div className="theme-customizer">
      {/* Only show the toggle button when not controlled externally */}
      {!onClose && (
        <button
          className="theme-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Customize Love Theme"
        >
          <HeartLogo size="small" animated={false} color="primary" />
          <Palette size={14} />
        </button>
      )}

      {/* Show panel when either controlled externally or internally */}
      {shouldShowPanel && (
        <>
          <div
            className="theme-customizer-backdrop"
            onClick={handleBackdropClick}
          />
          <div
            ref={panelRef}
            className={`theme-customizer-panel ${isDragging ? "dragging" : ""}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              cursor: isDragging ? "grabbing" : "default",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="theme-panel-header">
              <HeartLogo size="small" color="primary" />
              <h3>Love Themes</h3>
              <div className="header-controls">
                <div className="drag-indicator" title="Drag to move">
                  <Move size={16} />
                </div>
                <button className="close-btn" onClick={() => {
                  if (onClose) {
                    onClose();
                  } else {
                    setIsOpen(false);
                  }
                }}>
                  ×
                </button>
              </div>
            </div>

            <div className="theme-options">
              <div className="dark-mode-toggle">
                <button
                  className={`mode-btn ${!isDark ? "active" : ""}`}
                  onClick={() => onToggleDark(false)}
                >
                  <Sun size={16} />
                  Light
                </button>
                <button
                  className={`mode-btn ${isDark ? "active" : ""}`}
                  onClick={() => onToggleDark(true)}
                >
                  <Moon size={16} />
                  Dark
                </button>
              </div>

              <div className="theme-grid">
                {loveThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-option ${
                      currentTheme === `theme-${theme.id}` ? "active" : ""
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <div className="theme-preview">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="theme-info">
                      <h4>{theme.name}</h4>
                      <p>{theme.description}</p>
                    </div>
                    {currentTheme === `theme-${theme.id}` && (
                      <div className="active-indicator">
                        <Heart size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="theme-preview-section">
                <h4>Preview</h4>
                <div className="preview-card love-card">
                  <div className="preview-header">
                    <HeartLogo size="small" />
                    <span>Luv Notes</span>
                  </div>
                  <p>Your lovely notes with beautiful themes! 💕</p>
                  <button className="love-button preview-btn">
                    Create Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeCustomizer;
