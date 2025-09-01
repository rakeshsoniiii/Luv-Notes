import React, { useState } from "react";
import {
  Heart,
  Save,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Settings,
  Star,
  Sparkles,
  Mic,
  Camera,
  Send,
  Check,
  X,
  Play,
  Pause,
  Volume2,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import "./ButtonShowcase.css";

const ButtonShowcase = () => {
  const [loading, setLoading] = useState({});
  const [activeToggle, setActiveToggle] = useState(false);
  const { theme, setTheme, isDark, setIsDark } = useTheme();

  const handleLoadingDemo = (buttonId) => {
    setLoading((prev) => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoading((prev) => ({ ...prev, [buttonId]: false }));
    }, 2000);
  };

  return (
    <div className="button-showcase">
      <div className="showcase-header">
        <h1>🎨 Cool Button Design System</h1>
        <p>Beautiful, modern buttons with love-themed styling</p>
      </div>

      <div className="showcase-section">
        <h2>Primary Buttons</h2>
        <div className="button-grid">
          <button className="btn-base btn-primary">
            <Heart size={16} />
            Love Button
          </button>
          <button className="btn-base btn-primary btn-lg">
            <Save size={18} />
            Save Note
          </button>
          <button className="btn-base btn-primary" disabled>
            <Upload size={16} />
            Disabled
          </button>
          <button
            className={`btn-base btn-primary ${
              loading.primary ? "btn-loading" : ""
            }`}
            onClick={() => handleLoadingDemo("primary")}
          >
            <Download size={16} />
            {loading.primary ? "Loading..." : "Click Me"}
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Secondary Buttons</h2>
        <div className="button-grid">
          <button className="btn-base btn-secondary">
            <Edit size={16} />
            Edit
          </button>
          <button className="btn-base btn-secondary btn-sm">
            <Settings size={14} />
            Settings
          </button>
          <button className="btn-base btn-secondary btn-xl">
            <Star size={20} />
            Premium
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Action Buttons</h2>
        <div className="button-grid">
          <button className="btn-base btn-success">
            <Check size={16} />
            Success
          </button>
          <button className="btn-base btn-warning">
            <Upload size={16} />
            Warning
          </button>
          <button className="btn-base btn-danger">
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Special Effects</h2>
        <div className="button-grid">
          <button className="btn-base btn-glass">
            <Sparkles size={16} />
            Glass Effect
          </button>
          <button className="btn-base btn-neon">
            <Star size={16} />
            Neon Glow
          </button>
          <button className="btn-base btn-gradient-border">
            <Heart size={16} />
            Gradient Border
          </button>
          <button className="btn-base btn-pulse btn-primary">
            <Mic size={16} />
            Pulse Effect
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Icon Buttons</h2>
        <div className="button-grid">
          <button className="btn-base btn-icon btn-primary">
            <Plus size={16} />
          </button>
          <button className="btn-base btn-icon btn-ghost">
            <Settings size={16} />
          </button>
          <button className="btn-base btn-icon btn-danger">
            <X size={16} />
          </button>
          <button className="btn-base btn-icon btn-success">
            <Check size={16} />
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Button Groups</h2>
        <div className="btn-group">
          <button className="btn-base btn-primary">
            <Play size={16} />
            Play
          </button>
          <button className="btn-base btn-primary">
            <Pause size={16} />
            Pause
          </button>
          <button className="btn-base btn-primary">
            <Volume2 size={16} />
            Volume
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Toggle Buttons</h2>
        <div className="button-grid">
          <button
            className={`btn-base btn-toggle ${activeToggle ? "active" : ""}`}
            onClick={() => setActiveToggle(!activeToggle)}
          >
            <Star size={16} />
            {activeToggle ? "Active" : "Inactive"}
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Voice & AI Buttons</h2>
        <div className="button-grid">
          <button className="voice-btn">
            <Mic size={16} />
            <span className="voice-btn-text">Record</span>
          </button>
          <button className="voice-btn active">
            <Mic size={16} />
            <span className="voice-btn-text">Recording</span>
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Floating Action Button</h2>
        <button className="btn-fab">
          <Plus size={24} />
        </button>
      </div>

      <div className="showcase-section">
        <h2>Button Sizes</h2>
        <div className="button-grid">
          <button className="btn-base btn-primary btn-sm">
            <Search size={14} />
            Small
          </button>
          <button className="btn-base btn-primary">
            <Send size={16} />
            Default
          </button>
          <button className="btn-base btn-primary btn-lg">
            <Camera size={18} />
            Large
          </button>
          <button className="btn-base btn-primary btn-xl">
            <Heart size={20} />
            Extra Large
          </button>
        </div>
      </div>

      <div className="showcase-section">
        <h2>Theme Testing</h2>
        <div className="theme-test-controls">
          <div className="theme-selector">
            <h4>
              Current Theme: {theme.replace("theme-", "").replace("-", " ")}
            </h4>
            <div className="theme-buttons">
              <button
                className="btn-base btn-secondary btn-sm"
                onClick={() => setTheme("theme-love-classic")}
              >
                Classic
              </button>
              <button
                className="btn-base btn-secondary btn-sm"
                onClick={() => setTheme("theme-love-rose")}
              >
                Rose
              </button>
              <button
                className="btn-base btn-secondary btn-sm"
                onClick={() => setTheme("theme-love-sunset")}
              >
                Sunset
              </button>
              <button
                className="btn-base btn-secondary btn-sm"
                onClick={() => setTheme("theme-love-purple")}
              >
                Purple
              </button>
              <button
                className="btn-base btn-secondary btn-sm"
                onClick={() => setTheme("theme-love-coral")}
              >
                Coral
              </button>
            </div>
          </div>
          <div className="mode-selector">
            <h4>Mode: {isDark ? "Dark" : "Light"}</h4>
            <div className="mode-buttons">
              <button
                className={`btn-base ${
                  !isDark ? "btn-primary" : "btn-ghost"
                } btn-sm`}
                onClick={() => setIsDark(false)}
              >
                <Sun size={14} />
                Light
              </button>
              <button
                className={`btn-base ${
                  isDark ? "btn-primary" : "btn-ghost"
                } btn-sm`}
                onClick={() => setIsDark(true)}
              >
                <Moon size={14} />
                Dark
              </button>
            </div>
          </div>
        </div>
        <div className="theme-preview-card">
          <h4>Live Preview</h4>
          <p>
            Current theme colors are automatically applied to all buttons above!
          </p>
          <div className="color-swatches">
            <div className="swatch primary" title="Primary Color"></div>
            <div className="swatch secondary" title="Secondary Color"></div>
            <div className="swatch accent" title="Accent Color"></div>
          </div>
        </div>
      </div>

      <div className="showcase-footer">
        <p>✨ All buttons are responsive and accessible</p>
        <p>💝 Built with love for the Luv Notes app</p>
      </div>
    </div>
  );
};

export default ButtonShowcase;
