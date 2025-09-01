import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false); // Default to light for love themes
  const [theme, setTheme] = useState('theme-love-classic'); // Default love theme

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    const savedLoveTheme = localStorage.getItem('love-theme');
    
    if (savedMode) {
      setIsDark(savedMode === 'dark');
    }
    if (savedLoveTheme) {
      setTheme(savedLoveTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    localStorage.setItem('love-theme', theme);
    
    // Clear all existing theme classes
    document.documentElement.className = '';
    
    // Apply the selected love theme
    document.documentElement.classList.add(theme);
    
    // Apply dark mode if enabled
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    
    // Keep legacy data-theme for compatibility
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Force a style recalculation to ensure CSS variables are updated
    document.documentElement.style.display = 'none';
    document.documentElement.offsetHeight; // Trigger reflow
    document.documentElement.style.display = '';
  }, [isDark, theme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      setIsDark,
      theme, 
      setTheme, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};