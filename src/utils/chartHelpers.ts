/**
 * Chart Utilities - Theme-aware helpers for charts
 */

/**
 * Get theme-aware gradient for chart bars
 */
export const getChartGradient = (variant: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
  const colors = {
    primary: {
      from: 'var(--chart-primary)',
      to: 'var(--chart-secondary)',
    },
    secondary: {
      from: 'var(--chart-secondary)',
      to: 'var(--chart-tertiary)',
    },
    tertiary: {
      from: 'var(--chart-tertiary)',
      to: 'var(--chart-primary)',
    },
  };

  return `linear-gradient(135deg, ${colors[variant].from}, ${colors[variant].to})`;
};

/**
 * Get theme-aware color for chart elements
 */
export const getChartColor = (type: 'primary' | 'secondary' | 'tertiary' | 'text' | 'border') => {
  const vars = {
    primary: 'var(--chart-primary)',
    secondary: 'var(--chart-secondary)',
    tertiary: 'var(--chart-tertiary)',
    text: 'var(--text-secondary)',
    border: 'var(--border-primary)',
  };

  return vars[type];
};

/**
 * Calculate opacity-adjusted color for bars
 */
export const getBarOpacity = (value: number, maxValue: number, minOpacity = 0.3): number => {
  if (maxValue === 0) return minOpacity;
  return Math.max(minOpacity, (value / maxValue) * 1.0);
};

/**
 * Get intensity-based gradient with opacity
 */
export const getIntensityGradient = (intensity: number, maxIntensity: number) => {
  const opacity = getBarOpacity(intensity, maxIntensity, 0.2);
  return {
    background: `linear-gradient(180deg,
      color-mix(in srgb, var(--chart-primary) ${opacity * 100}%, transparent),
      color-mix(in srgb, var(--chart-secondary) ${opacity * 100}%, transparent)
    )`,
  };
};

/**
 * Format tooltip text with theme colors
 */
export const formatTooltip = (label: string, value: number | string, unit?: string) => {
  return {
    label,
    value: `${value}${unit || ''}`,
    style: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: 'var(--shadow-md)',
    },
  };
};

/**
 * Get peak highlight color
 */
export const getPeakStyle = () => ({
  background: getChartGradient('primary'),
  boxShadow: 'var(--shadow-glow)',
});

/**
 * Get weekend highlight color
 */
export const getWeekendStyle = () => ({
  background: `linear-gradient(180deg, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 60%, transparent))`,
});

/**
 * Check if a color is light or dark (for contrast)
 */
export const isLightColor = (color: string): boolean => {
  // Simple heuristic based on RGB values
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};
