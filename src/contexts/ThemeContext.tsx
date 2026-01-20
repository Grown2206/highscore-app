import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, themes, defaultTheme } from '../config/themes';

interface ThemeContextType {
  currentTheme: Theme;
  themeId: string;
  setTheme: (themeId: string) => void;
  availableThemes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    const saved = localStorage.getItem('highscore-theme');
    return saved && themes[saved] ? saved : defaultTheme;
  });

  const currentTheme = themes[themeId];

  useEffect(() => {
    localStorage.setItem('highscore-theme', themeId);
    applyThemeVariables(currentTheme);
  }, [themeId, currentTheme]);

  const setTheme = (newThemeId: string) => {
    if (themes[newThemeId]) {
      setThemeId(newThemeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeId, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

function applyThemeVariables(theme: Theme) {
  const root = document.documentElement;

  // Background colors
  root.style.setProperty('--bg-primary', theme.colors.bg.primary);
  root.style.setProperty('--bg-secondary', theme.colors.bg.secondary);
  root.style.setProperty('--bg-tertiary', theme.colors.bg.tertiary);
  root.style.setProperty('--bg-card', theme.colors.bg.card);
  root.style.setProperty('--bg-hover', theme.colors.bg.hover);

  // Text colors
  root.style.setProperty('--text-primary', theme.colors.text.primary);
  root.style.setProperty('--text-secondary', theme.colors.text.secondary);
  root.style.setProperty('--text-tertiary', theme.colors.text.tertiary);
  root.style.setProperty('--text-inverse', theme.colors.text.inverse);

  // Accent colors
  root.style.setProperty('--accent-primary', theme.colors.accent.primary);
  root.style.setProperty('--accent-secondary', theme.colors.accent.secondary);
  root.style.setProperty('--accent-success', theme.colors.accent.success);
  root.style.setProperty('--accent-warning', theme.colors.accent.warning);
  root.style.setProperty('--accent-error', theme.colors.accent.error);
  root.style.setProperty('--accent-info', theme.colors.accent.info);

  // Chart colors
  root.style.setProperty('--chart-primary', theme.colors.chart.primary);
  root.style.setProperty('--chart-secondary', theme.colors.chart.secondary);
  root.style.setProperty('--chart-tertiary', theme.colors.chart.tertiary);
  root.style.setProperty('--chart-gradient1', theme.colors.chart.gradient1);
  root.style.setProperty('--chart-gradient2', theme.colors.chart.gradient2);

  // Border colors
  root.style.setProperty('--border-primary', theme.colors.border.primary);
  root.style.setProperty('--border-secondary', theme.colors.border.secondary);
  root.style.setProperty('--border-focus', theme.colors.border.focus);

  // Effects - Shadows
  root.style.setProperty('--shadow-sm', theme.effects.shadow.sm);
  root.style.setProperty('--shadow-md', theme.effects.shadow.md);
  root.style.setProperty('--shadow-lg', theme.effects.shadow.lg);
  root.style.setProperty('--shadow-glow', theme.effects.shadow.glow);

  // Effects - Blur & Border Radius
  root.style.setProperty('--blur', theme.effects.blur);
  root.style.setProperty('--radius-sm', theme.effects.borderRadius.sm);
  root.style.setProperty('--radius-md', theme.effects.borderRadius.md);
  root.style.setProperty('--radius-lg', theme.effects.borderRadius.lg);
  root.style.setProperty('--radius-xl', theme.effects.borderRadius.xl);
}
