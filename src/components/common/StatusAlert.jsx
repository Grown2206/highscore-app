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
};

export default function StatusAlert({ type, children, iconSize = 14, className = '' }) {
  const baseClasses = 'p-3 rounded-xl border flex items-center gap-2 text-sm';
  const typeClasses = TYPE_CLASSES[type] || TYPE_CLASSES.error;

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`}>
      <AlertCircle size={iconSize} />
      {children}
    </div>
  );
}
