import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  variant?: 'default' | 'gradient' | 'minimal';
}

/**
 * Glassmorphism Chart Card Component
 * Theme-aware card with backdrop blur and dynamic borders
 */
export default function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
  headerRight,
  variant = 'default',
}: ChartCardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, var(--bg-card), var(--bg-secondary))`,
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-md)',
        };
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          border: '1px solid var(--border-primary)',
          boxShadow: 'none',
        };
      default:
        return {
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'var(--blur)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)',
        };
    }
  };

  const cardStyles = getCardStyles();

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${className}`}
      style={{
        ...cardStyles,
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--accent-primary)',
              }}
            >
              <Icon size={20} />
            </div>
          )}
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: 'var(--accent-primary)' }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
