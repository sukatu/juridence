import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeDebugger = () => {
  const { theme, isDark } = useTheme();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        theme,
        isDark,
        documentClass: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute('data-theme'),
        localStorage: localStorage.getItem('theme'),
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();

    // Listen for theme changes
    const handleThemeChange = (event) => {
      updateDebugInfo();
    };

    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [theme, isDark]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Theme Debug</h3>
      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <div>Theme: <span className="font-mono">{theme}</span></div>
        <div>Is Dark: <span className="font-mono">{isDark.toString()}</span></div>
        <div>Document Class: <span className="font-mono">{debugInfo.documentClass}</span></div>
        <div>Data Theme: <span className="font-mono">{debugInfo.dataTheme}</span></div>
        <div>LocalStorage: <span className="font-mono">{debugInfo.localStorage}</span></div>
        <div>Updated: <span className="font-mono">{debugInfo.timestamp}</span></div>
      </div>
    </div>
  );
};

export default ThemeDebugger;
