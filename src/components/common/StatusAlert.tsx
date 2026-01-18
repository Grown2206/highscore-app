import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Status Alert Component
 * Displays success, error, info, or warning messages with consistent styling
 */

const TYPE_CLASSES = {
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
  error: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
} as const;

export type AlertType = keyof typeof TYPE_CLASSES;

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
  const baseClasses = 'p-3 rounded-xl border flex items-center gap-2 text-sm';
  // Runtime guard: fallback to 'error' for invalid types from non-TS or loosely typed call sites
  const typeClasses = TYPE_CLASSES[type] || TYPE_CLASSES.error;

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`}>
      <AlertCircle size={iconSize} />
      {children}
    </div>
  );
}
