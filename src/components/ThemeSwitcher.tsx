import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronDown, Check } from 'lucide-react';

interface ThemeSwitcherProps {
  compact?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false }) => {
  const { currentTheme, themeId, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themePreview = {
    dark: '🌙',
    light: '☀️',
    cannabis: '🌿',
    neon: '⚡',
    minimal: '⬜',
  };

  const themeDescriptions = {
    dark: 'Klassisches dunkles Design',
    light: 'Helles, klares Interface',
    cannabis: 'Grün-Purple Cannabis Theme',
    neon: 'Cyberpunk Pink-Cyan',
    minimal: 'Reduziertes Monochrom',
  };

  // Memoize to avoid re-running effects on every render
  const themeEntries = useMemo(() => Object.entries(availableThemes), [availableThemes]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % themeEntries.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + themeEntries.length) % themeEntries.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            const [id] = themeEntries[focusedIndex];
            setTheme(id);
            setIsOpen(false);
            buttonRef.current?.focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(themeEntries.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, themeEntries, setTheme]);

  // Focus first item when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = themeEntries.findIndex(([id]) => id === themeId);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, themeId, themeEntries]);

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
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={themeId === id}
          >
            {themePreview[id as keyof typeof themePreview]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Selected Theme Display - Clickable to toggle dropdown */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="w-full rounded-xl p-4 transition-all duration-200 border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-primary)',
          boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Theme selector"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Current Theme Icon */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.chart.gradient1}, ${currentTheme.colors.chart.gradient2})`,
              }}
              aria-hidden="true"
            >
              {themePreview[themeId as keyof typeof themePreview]}
            </div>

            {/* Current Theme Info */}
            <div className="text-left">
              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {currentTheme.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {themeDescriptions[themeId as keyof typeof themeDescriptions]}
              </div>
            </div>
          </div>

          {/* Chevron Icon */}
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--accent-primary)' }}
            aria-hidden="true"
          />
        </div>

        {/* Color Preview Bar */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden mt-3" aria-hidden="true">
          <div
            className="flex-1 rounded-l-full"
            style={{ backgroundColor: currentTheme.colors.accent.primary }}
          />
          <div
            className="flex-1"
            style={{ backgroundColor: currentTheme.colors.accent.secondary }}
          />
          <div
            className="flex-1 rounded-r-full"
            style={{ backgroundColor: currentTheme.colors.chart.tertiary }}
          />
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Available themes"
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="max-h-96 overflow-y-auto">
            {themeEntries.map(([id, theme], index) => {
              const isSelected = themeId === id;
              const isFocused = focusedIndex === index;

              return (
                <div
                  key={id}
                  onClick={() => {
                    setTheme(id);
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setTheme(id);
                      setIsOpen(false);
                      buttonRef.current?.focus();
                    }
                  }}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  className={`
                    w-full p-4 text-left transition-all duration-200 border-b last:border-b-0 cursor-pointer
                    ${!isSelected && 'hover:bg-[color-mix(in_srgb,var(--bg-tertiary)_50%,transparent)]'}
                    ${isFocused && 'ring-2 ring-inset ring-[var(--accent-primary)]'}
                  `}
                  style={{
                    backgroundColor: isSelected
                      ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)'
                      : 'transparent',
                    borderColor: 'var(--border-primary)',
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    {/* Theme Icon */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.chart.gradient1}, ${theme.colors.chart.gradient2})`,
                      }}
                      aria-hidden="true"
                    >
                      {themePreview[id as keyof typeof themePreview]}
                    </div>

                    {/* Theme Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: theme.colors.text.primary }}>
                          {theme.name}
                        </span>
                        {isSelected && (
                          <Check size={16} style={{ color: 'var(--accent-success)' }} aria-hidden="true" />
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: theme.colors.text.tertiary }}>
                        {themeDescriptions[id as keyof typeof themeDescriptions]}
                      </div>
                    </div>

                    {/* Color Preview Dots */}
                    <div className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: theme.colors.accent.primary,
                          borderColor: theme.colors.bg.primary,
                        }}
                        title="Primary"
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: theme.colors.accent.secondary,
                          borderColor: theme.colors.bg.primary,
                        }}
                        title="Secondary"
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: theme.colors.chart.tertiary,
                          borderColor: theme.colors.bg.primary,
                        }}
                        title="Tertiary"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <div
            className="p-2 text-center border-t"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              Änderungen werden sofort übernommen • ESC zum Schließen
            </span>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            buttonRef.current?.focus();
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;
