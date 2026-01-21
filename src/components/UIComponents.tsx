import React, { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  val: string | number;
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success';
}

interface AdminMetricProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  active?: boolean;
}

/**
 * Enhanced Metric Card Component (v8.2 - Theme Support)
 * Displays a single metric with icon, label, and value with gradient background and animations
 */
export const MetricCard = ({ label, val, icon, variant = 'primary' }: MetricCardProps) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return 'var(--accent-primary)';
      case 'secondary':
        return 'var(--accent-secondary)';
      case 'tertiary':
        return 'var(--chart-tertiary)';
      case 'success':
        return 'var(--accent-success)';
      default:
        return 'var(--accent-primary)';
    }
  };

  const variantColor = getVariantColor();

  return (
    <div
      className="p-4 rounded-2xl flex flex-col justify-between h-24 group transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      {/* Gradient glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          backgroundColor: `color-mix(in srgb, ${variantColor} 5%, transparent)`,
        }}
      />

      {/* Icon + Label */}
      <div
        className="flex items-center gap-2 text-xs font-bold uppercase relative z-10"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div className="flex items-center justify-center w-5 h-5">{icon}</div>
        {label}
      </div>

      {/* Value */}
      <div
        className="text-2xl font-bold font-mono truncate group-hover:scale-105 transition-transform relative z-10"
        style={{ color: variantColor }}
      >
        {val}
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${variantColor}, transparent)`,
        }}
      />
    </div>
  );
};

/**
 * Enhanced Admin Metric Component (v8.2 - Theme Support)
 * Displays admin/debug metrics with active state and optional subtitle
 */
export const AdminMetric = ({ label, value, subtitle, icon, active = false }: AdminMetricProps) => {
  return (
    <div
      className="p-3 flex flex-col items-start gap-1 transition-all duration-300 relative overflow-hidden group"
      style={{
        backgroundColor: active
          ? 'color-mix(in srgb, var(--accent-success) 10%, transparent)'
          : 'var(--bg-secondary)',
        border: active
          ? '1px solid color-mix(in srgb, var(--accent-success) 20%, transparent)'
          : '1px solid var(--border-primary)',
      }}
    >
      {/* Active pulse effect */}
      {active && (
        <div className="absolute top-1 right-1 w-2 h-2">
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: 'var(--accent-success)' }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: 'var(--accent-success)' }}
          />
        </div>
      )}

      {/* Icon + Label */}
      <div
        className="flex items-center gap-1.5 text-[9px] uppercase font-bold"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div className="flex items-center justify-center">{icon}</div>
        {label}
      </div>

      {/* Value */}
      <div
        className="text-sm font-mono font-bold transition-colors"
        style={{
          color: active ? 'var(--accent-success)' : 'var(--text-primary)',
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </div>
      )}

      {/* Active glow effect */}
      {active && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-success) 5%, transparent)',
          }}
        />
      )}
    </div>
  );
};
