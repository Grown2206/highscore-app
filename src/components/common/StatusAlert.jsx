import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Status Alert Component
 * Displays success or error messages with consistent styling
 */
export default function StatusAlert({ type, children, iconSize = 14, className = '' }) {
  const baseClasses = 'p-3 rounded-xl border flex items-center gap-2 text-sm';
  const typeClasses =
    type === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      : 'bg-rose-500/10 border-rose-500/20 text-rose-500';

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`}>
      <AlertCircle size={iconSize} />
      {children}
    </div>
  );
}
