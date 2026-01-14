import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Apply theme to DOM
  const applyTheme = useCallback((newTheme) => {
    // Remove existing theme classes from both html and body
    document.documentElement.classList.remove('light', 'dark');
    document.body.classList.remove('light', 'dark');
    
    // Add new theme class to both html and body
    document.documentElement.classList.add(newTheme);
    document.body.classList.add(newTheme);
    
    // Set data attribute for additional styling
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1e293b' : '#ffffff');
    
    // Force a reflow to ensure styles are applied
    void document.documentElement.offsetHeight;
  }, []);

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to DOM
    applyTheme(theme);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme, isDark: theme === 'dark' } 
    }));
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
