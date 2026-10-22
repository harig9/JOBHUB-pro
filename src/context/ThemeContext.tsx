import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'blue' | 'emerald' | 'violet' | 'slate';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('jobhub_theme') as ThemeMode;
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    try {
      const saved = localStorage.getItem('jobhub_accent') as AccentColor;
      return saved === 'indigo' || saved === 'blue' || saved === 'emerald' || saved === 'violet' || saved === 'slate'
        ? saved
        : 'indigo';
    } catch {
      return 'indigo';
    }
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-accent', accentColor);
  }, [resolvedTheme, accentColor]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('jobhub_theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const setAccentColor = (newAccent: AccentColor) => {
    setAccentColorState(newAccent);
    try {
      localStorage.setItem('jobhub_accent', newAccent);
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
