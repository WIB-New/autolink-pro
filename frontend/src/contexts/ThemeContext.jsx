import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('autolink_theme');
    // Forcer le thème clair par défaut pour éviter l'écran noir
    if (saved) return saved === 'dark';
    return false; // Toujours en mode clair par défaut
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('autolink_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Forcer le thème clair au démarrage pour éviter l'écran noir
  useEffect(() => {
    const saved = localStorage.getItem('autolink_theme');
    if (saved === 'dark') {
      setIsDark(false);
      localStorage.setItem('autolink_theme', 'light');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}
