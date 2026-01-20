import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ACCENT_PRESETS = [
  { name: 'Emerald', primary: '#10b981', secondary: '#84cc16' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#06b6d4' },
  { name: 'Purple', primary: '#a855f7', secondary: '#ec4899' },
  { name: 'Orange', primary: '#f97316', secondary: '#eab308' },
  { name: 'Red', primary: '#ef4444', secondary: '#f59e0b' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#06b6d4' },
  { name: 'Pink', primary: '#ec4899', secondary: '#f472b6' },
  { name: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6' },
];

const AccentColorPicker: React.FC = () => {
  const { currentTheme } = useTheme();
  const [customPrimary, setCustomPrimary] = useState(currentTheme.colors.accent.primary);
  const [customSecondary, setCustomSecondary] = useState(currentTheme.colors.accent.secondary);
  const [showCustom, setShowCustom] = useState(false);

  const applyAccentColors = (primary: string, secondary: string) => {
    document.documentElement.style.setProperty('--accent-primary', primary);
    document.documentElement.style.setProperty('--accent-secondary', secondary);
    document.documentElement.style.setProperty('--chart-primary', primary);
    document.documentElement.style.setProperty('--chart-secondary', secondary);
    document.documentElement.style.setProperty('--chart-gradient1', primary);
    document.documentElement.style.setProperty('--chart-gradient2', secondary);
    document.documentElement.style.setProperty('--border-focus', primary);

    // Save to localStorage
    localStorage.setItem('custom-accent-primary', primary);
    localStorage.setItem('custom-accent-secondary', secondary);
  };

  const handlePresetClick = (preset: typeof ACCENT_PRESETS[0]) => {
    applyAccentColors(preset.primary, preset.secondary);
    setCustomPrimary(preset.primary);
    setCustomSecondary(preset.secondary);
  };

  const handleCustomApply = () => {
    applyAccentColors(customPrimary, customSecondary);
  };

  const resetToThemeDefault = () => {
    applyAccentColors(
      currentTheme.colors.accent.primary,
      currentTheme.colors.accent.secondary
    );
    setCustomPrimary(currentTheme.colors.accent.primary);
    setCustomSecondary(currentTheme.colors.accent.secondary);
    localStorage.removeItem('custom-accent-primary');
    localStorage.removeItem('custom-accent-secondary');
  };

  return (
    <div className="space-y-4">
      {/* Preset Colors */}
      <div>
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Vordefinierte Farben
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className="group relative aspect-square rounded-lg overflow-hidden transition-transform hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
              }}
              title={preset.name}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  {preset.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm font-medium mb-2 flex items-center gap-2 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          {showCustom ? '▼' : '▶'} Eigene Farben
        </button>

        {showCustom && (
          <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Primär
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="flex-1 px-2 py-1 rounded text-sm font-mono"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Sekundär
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="flex-1 px-2 py-1 rounded text-sm font-mono"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCustomApply}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${customPrimary}, ${customSecondary})`,
                  color: 'white',
                }}
              >
                Anwenden
              </button>
              <button
                onClick={resetToThemeDefault}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccentColorPicker;
