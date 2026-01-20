/**
 * Theme System - 5 Themes
 *
 * 1. Dark (Standard) - Current design
 * 2. Light - Clean light theme
 * 3. Cannabis - Green/Purple vibes
 * 4. Neon - Cyberpunk pink/cyan
 * 5. Minimal - Monochrome minimalist
 */

export interface Theme {
  id: string;
  name: string;
  colors: {
    // Background colors
    bg: {
      primary: string;
      secondary: string;
      tertiary: string;
      card: string;
      hover: string;
    };
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    // Accent colors
    accent: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    // Chart colors
    chart: {
      primary: string;
      secondary: string;
      tertiary: string;
      gradient1: string;
      gradient2: string;
    };
    // Border & divider
    border: {
      primary: string;
      secondary: string;
      focus: string;
    };
  };
  effects: {
    shadow: {
      sm: string;
      md: string;
      lg: string;
      glow: string;
    };
    blur: string;
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      bg: {
        primary: '#09090b',
        secondary: '#18181b',
        tertiary: '#27272a',
        card: 'rgba(39, 39, 42, 0.5)',
        hover: 'rgba(63, 63, 70, 0.5)',
      },
      text: {
        primary: '#fafafa',
        secondary: '#a1a1aa',
        tertiary: '#71717a',
        inverse: '#18181b',
      },
      accent: {
        primary: '#10b981',
        secondary: '#84cc16',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      chart: {
        primary: '#10b981',
        secondary: '#84cc16',
        tertiary: '#fbbf24',
        gradient1: '#10b981',
        gradient2: '#84cc16',
      },
      border: {
        primary: '#3f3f46',
        secondary: '#52525b',
        focus: '#10b981',
      },
    },
    effects: {
      shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        glow: '0 0 20px rgba(16, 185, 129, 0.3)',
      },
      blur: 'blur(12px)',
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
      },
    },
  },

  light: {
    id: 'light',
    name: 'Light Mode',
    colors: {
      bg: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
        card: 'rgba(255, 255, 255, 0.8)',
        hover: 'rgba(243, 244, 246, 0.8)',
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        inverse: '#ffffff',
      },
      accent: {
        primary: '#059669',
        secondary: '#65a30d',
        success: '#16a34a',
        warning: '#d97706',
        error: '#dc2626',
        info: '#2563eb',
      },
      chart: {
        primary: '#10b981',
        secondary: '#84cc16',
        tertiary: '#f59e0b',
        gradient1: '#10b981',
        gradient2: '#3b82f6',
      },
      border: {
        primary: '#e5e7eb',
        secondary: '#d1d5db',
        focus: '#059669',
      },
    },
    effects: {
      shadow: {
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.15)',
        glow: '0 0 20px rgba(5, 150, 105, 0.2)',
      },
      blur: 'blur(12px)',
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
      },
    },
  },

  cannabis: {
    id: 'cannabis',
    name: 'Cannabis Vibes',
    colors: {
      bg: {
        primary: '#0f0f14',
        secondary: '#1a1a24',
        tertiary: '#252533',
        card: 'rgba(37, 37, 51, 0.6)',
        hover: 'rgba(55, 55, 71, 0.6)',
      },
      text: {
        primary: '#e8f5e9',
        secondary: '#a5d6a7',
        tertiary: '#81c784',
        inverse: '#1a1a24',
      },
      accent: {
        primary: '#9c27b0',
        secondary: '#4caf50',
        success: '#66bb6a',
        warning: '#ff9800',
        error: '#f44336',
        info: '#7c4dff',
      },
      chart: {
        primary: '#9c27b0',
        secondary: '#4caf50',
        tertiary: '#ff6f00',
        gradient1: '#9c27b0',
        gradient2: '#4caf50',
      },
      border: {
        primary: '#37374a',
        secondary: '#4a4a5e',
        focus: '#9c27b0',
      },
    },
    effects: {
      shadow: {
        sm: '0 1px 2px 0 rgb(156 39 176 / 0.1)',
        md: '0 4px 6px -1px rgb(156 39 176 / 0.2)',
        lg: '0 10px 15px -3px rgb(156 39 176 / 0.3)',
        glow: '0 0 30px rgba(156, 39, 176, 0.4)',
      },
      blur: 'blur(16px)',
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1.25rem',
        xl: '2rem',
      },
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon Cyberpunk',
    colors: {
      bg: {
        primary: '#0a0a0f',
        secondary: '#13131a',
        tertiary: '#1c1c26',
        card: 'rgba(28, 28, 38, 0.7)',
        hover: 'rgba(40, 40, 52, 0.7)',
      },
      text: {
        primary: '#f0f0ff',
        secondary: '#b0b0ff',
        tertiary: '#8080dd',
        inverse: '#0a0a0f',
      },
      accent: {
        primary: '#ff006e',
        secondary: '#00f0ff',
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff0055',
        info: '#0099ff',
      },
      chart: {
        primary: '#ff006e',
        secondary: '#00f0ff',
        tertiary: '#ffaa00',
        gradient1: '#ff006e',
        gradient2: '#00f0ff',
      },
      border: {
        primary: '#28283a',
        secondary: '#38384a',
        focus: '#ff006e',
      },
    },
    effects: {
      shadow: {
        sm: '0 0 5px rgba(255, 0, 110, 0.3)',
        md: '0 0 15px rgba(255, 0, 110, 0.4)',
        lg: '0 0 30px rgba(255, 0, 110, 0.5)',
        glow: '0 0 40px rgba(255, 0, 110, 0.6)',
      },
      blur: 'blur(20px)',
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f5f5f5',
        tertiary: '#eeeeee',
        card: 'rgba(255, 255, 255, 0.9)',
        hover: 'rgba(238, 238, 238, 0.9)',
      },
      text: {
        primary: '#212121',
        secondary: '#616161',
        tertiary: '#9e9e9e',
        inverse: '#ffffff',
      },
      accent: {
        primary: '#424242',
        secondary: '#757575',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
      },
      chart: {
        primary: '#212121',
        secondary: '#616161',
        tertiary: '#9e9e9e',
        gradient1: '#212121',
        gradient2: '#757575',
      },
      border: {
        primary: '#e0e0e0',
        secondary: '#bdbdbd',
        focus: '#424242',
      },
    },
    effects: {
      shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 2px 4px 0 rgb(0 0 0 / 0.08)',
        lg: '0 4px 8px 0 rgb(0 0 0 / 0.12)',
        glow: 'none',
      },
      blur: 'blur(8px)',
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
};

export const defaultTheme = 'dark';
