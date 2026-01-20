import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  compact?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false }) => {
  const { currentTheme, themeId, setTheme, availableThemes } = useTheme();

  const themePreview = {
    dark: '🌙',
    light: '☀️',
    cannabis: '🌿',
    neon: '⚡',
    minimal: '⬜',
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        {Object.entries(availableThemes).map(([id, theme]) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-xl
              transition-all duration-200
              ${themeId === id
                ? 'scale-110'
                : 'opacity-60 hover:opacity-100 hover:scale-105'
              }
            `}
            style={{
              backgroundColor: theme.colors.bg.secondary,
              color: theme.colors.text.primary,
              boxShadow: themeId === id
                ? `0 0 0 2px ${theme.colors.bg.primary}, 0 0 0 4px ${theme.colors.accent.primary}`
                : 'none',
            }}
            title={theme.name}
          >
            {themePreview[id as keyof typeof themePreview]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {Object.entries(availableThemes).map(([id, theme]) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`
            relative p-4 rounded-xl transition-all duration-300
            ${themeId === id
              ? 'scale-105'
              : 'opacity-70 hover:opacity-100 hover:scale-102'
            }
          `}
          style={{
            backgroundColor: theme.colors.bg.card,
            color: theme.colors.text.primary,
            boxShadow: themeId === id
              ? `0 0 0 2px ${theme.colors.bg.primary}, 0 0 0 4px ${theme.colors.accent.primary}, ${theme.effects.shadow.glow}`
              : 'none',
          }}
        >
          {/* Theme Preview Circle */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.chart.gradient1}, ${theme.colors.chart.gradient2})`,
              }}
            >
              {themePreview[id as keyof typeof themePreview]}
            </div>
            <div className="text-left">
              <div className="font-bold" style={{ color: theme.colors.text.primary }}>
                {theme.name}
              </div>
              {themeId === id && (
                <div className="text-xs" style={{ color: theme.colors.accent.success }}>
                  ✓ Aktiv
                </div>
              )}
            </div>
          </div>

          {/* Color Preview */}
          <div className="flex gap-1 h-6 rounded overflow-hidden">
            <div
              className="flex-1"
              style={{ backgroundColor: theme.colors.accent.primary }}
              title="Primary"
            />
            <div
              className="flex-1"
              style={{ backgroundColor: theme.colors.accent.secondary }}
              title="Secondary"
            />
            <div
              className="flex-1"
              style={{ backgroundColor: theme.colors.chart.tertiary }}
              title="Tertiary"
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
