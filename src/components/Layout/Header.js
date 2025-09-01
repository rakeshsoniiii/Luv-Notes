import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Settings as SettingsIcon, EyeOff, User, Palette, Save } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import ThemeCustomizer from "../UI/ThemeCustomizer";
import Settings from "../Settings/Settings";
import HiddenNotes from "../Notes/HiddenNotes";
import BackupManager from "../Notes/BackupManager";
import HeartLogo from "../UI/HeartLogo";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotesContext } from "../../contexts/FirebaseNotesContext";
import toast from "react-hot-toast";
import "./Layout.css";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme, isDark, setIsDark } = useTheme();
  const { notes } = useNotesContext();
  const [showSettings, setShowSettings] = useState(false);
  const [showHiddenNotes, setShowHiddenNotes] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleToggleDark = (dark) => {
    setIsDark(dark);
  };

  return (
    <header className={`header ${isDark ? 'dark' : ''}`}>
      <nav className="navbar">
        {/* Brand Section */}
        <div className="navbar-brand">
          <HeartLogo size="small" animated={true} color="primary" />
          <h1 className="app-title">Luv Notes</h1>
        </div>

        {/* Main Navigation - Hidden since buttons were non-functional */}
        <div className="navbar-nav">
          {/* Navigation buttons removed - they were non-functional */}
        </div>

        {/* User Section */}
        <div className="navbar-user">
          <div className="user-info">
            <User size={16} />
            <span className="user-name">
              {currentUser?.displayName || currentUser?.email?.split("@")[0]}
            </span>
          </div>
        </div>

                       {/* Tools Section */}
               <div className="navbar-tools">
                 <button
                   onClick={() => setShowThemeCustomizer(true)}
                   className="tool-btn theme-btn"
                   title="Customize Love Theme"
                 >
                   <Palette size={18} />
                   <span className="tool-text">Customize Themes</span>
                 </button>
                 
                 <button
                   onClick={() => setShowBackupManager(true)}
                   className="tool-btn backup-btn"
                   title="Backup Manager"
                 >
                   <Save size={18} />
                   <span className="tool-text">Backup</span>
                 </button>
                 
                 <ThemeToggle />
                 
                 <button
                   onClick={() => setShowHiddenNotes(true)}
                   className="tool-btn hidden-notes-btn"
                   title="Hidden Notes"
                 >
                   <EyeOff size={18} />
                   <span className="tool-text">Hidden</span>
                 </button>
                 
                 <button
                   onClick={() => setShowSettings(true)}
                   className="tool-btn settings-btn"
                   title="Settings"
                 >
                   <SettingsIcon size={18} />
                   <span className="tool-text">Settings</span>
                 </button>
                 
                 <button 
                   onClick={handleLogout} 
                   className="tool-btn logout-btn"
                   title="Logout"
                 >
                   <LogOut size={18} />
                   <span className="tool-text">Logout</span>
                 </button>
               </div>
      </nav>

      {/* Modals */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showHiddenNotes && <HiddenNotes onClose={() => setShowHiddenNotes(false)} />}
                   {showThemeCustomizer && (
               <ThemeCustomizer
                 currentTheme={theme}
                 onThemeChange={handleThemeChange}
                 isDark={isDark}
                 onToggleDark={handleToggleDark}
                 onClose={() => setShowThemeCustomizer(false)}
               />
             )}

             {showBackupManager && (
               <BackupManager
                 notes={notes}
                 onClose={() => setShowBackupManager(false)}
                 isVisible={showBackupManager}
                 onRestore={(restoredNotes) => {
                   // Handle backup restoration
                   console.log('Backup restored:', restoredNotes);
                   setShowBackupManager(false);
                 }}
               />
             )}
           </header>
         );
       };

export default Header;