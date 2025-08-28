import React, { useEffect, useState } from 'react';
import { ThemeContext } from '../lib/theme-context';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no saved preference, use system preference
      setTheme(systemPreference);
    }
  }, [systemPreference]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const effectiveTheme = theme === 'system' ? systemPreference : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Set data attribute for CSS customization
    root.setAttribute('data-theme', effectiveTheme);
  }, [theme, systemPreference]);

  const setThemeMode = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
  };

  const getEffectiveTheme = () => {
    return theme === 'system' ? systemPreference : theme;
  };

  const value = {
    theme,
    setTheme: setThemeMode,
    toggleTheme,
    systemPreference,
    effectiveTheme: getEffectiveTheme(),
    isDark: getEffectiveTheme() === 'dark',
    isLight: getEffectiveTheme() === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};