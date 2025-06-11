import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const getSystemTheme = useCallback(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const [darkMode, setDarkMode] = useState(() => {
    if (theme === 'system') {
      return getSystemTheme() === 'dark';
    }
    return theme === 'dark';
  });

  // Update dark mode when theme changes
  useEffect(() => {
    if (theme === 'system') {
      setDarkMode(getSystemTheme() === 'dark');
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setDarkMode(mediaQuery.matches);
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    } else {
      setDarkMode(theme === 'dark');
    }
  }, [theme, getSystemTheme]);

  // Apply theme class to root HTML element and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    
    // Also set a data-theme attribute for more specific CSS targeting if needed
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const setThemePreference = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const value = {
    darkMode,
    theme,
    setTheme: setThemePreference,
    toggleDarkMode: () => {
      const newTheme = darkMode ? 'light' : 'dark';
      setThemePreference(newTheme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
