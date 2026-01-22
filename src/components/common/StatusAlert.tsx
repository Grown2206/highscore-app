import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Status Alert Component
 * Displays success, error, info, or warning messages with consistent styling
 * Theme-aware using CSS variables
 */

const TYPE_STYLES = {
  success: {
    colorVar: '--accent-success',
  },
  error: {
    colorVar: '--accent-error',
  },
  info: {
    colorVar: '--accent-info',
  },
  warning: {
    colorVar: '--accent-warning',
  },
} as const;

/**
 * Valid alert types for StatusAlert component.
 *
 * Note: The component includes a runtime guard that falls back to 'error' styling
 * for invalid type values from non-TypeScript or loosely typed call sites.
 */
export type AlertType = keyof typeof TYPE_STYLES;

interface StatusAlertProps {
  type: AlertType;
  children: React.ReactNode;
  iconSize?: number;
  className?: string;
}

export default function StatusAlert({
  type,
  children,
  iconSize = 14,
  className = ''
}: StatusAlertProps) {
  const safeType = Object.hasOwn(TYPE_STYLES, type as PropertyKey)
    ? (type as keyof typeof TYPE_STYLES)
    : 'error';
  const { colorVar } = TYPE_STYLES[safeType];

  return (
    <div
      className={`p-3 rounded-xl border flex items-center gap-2 text-sm ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, var(${colorVar}) 10%, transparent)`,
        borderColor: `color-mix(in srgb, var(${colorVar}) 20%, transparent)`,
        color: `var(${colorVar})`,
      }}
    >
      <AlertCircle size={iconSize} />
      {children}
    </div>
  );
}
