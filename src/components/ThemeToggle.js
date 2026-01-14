import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative inline-flex items-center justify-center w-10 h-10 rounded-lg
        transition-all duration-200 ease-in-out
        ${isDark 
          ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' 
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
        }
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
