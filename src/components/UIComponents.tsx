import React, { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  val: string | number;
  icon: ReactNode;
  color: string;
}

interface AdminMetricProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  active?: boolean;
}

/**
 * Enhanced Metric Card Component
 * Displays a single metric with icon, label, and value with gradient background and animations
 */
export const MetricCard = ({ label, val, icon, color }: MetricCardProps) => {
  // Extract color name from className (e.g., "text-emerald-400" -> "emerald")
  const colorName = color.match(/text-(\w+)-/)?.[1] || 'zinc';

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-24 group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Gradient glow effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
        colorName === 'emerald' ? 'bg-emerald-500/5' :
        colorName === 'lime' ? 'bg-lime-500/5' :
        colorName === 'amber' ? 'bg-amber-500/5' :
        colorName === 'zinc' ? 'bg-zinc-500/5' :
        'bg-zinc-500/5'
      }`}></div>

      {/* Icon + Label */}
      <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase relative z-10">
        <div className="flex items-center justify-center w-5 h-5">
          {icon}
        </div>
        {label}
      </div>

      {/* Value */}
      <div className={`text-2xl font-bold font-mono truncate ${color} group-hover:scale-105 transition-transform relative z-10`}>
        {val}
      </div>

      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${
        colorName === 'emerald' ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' :
        colorName === 'lime' ? 'bg-gradient-to-r from-transparent via-lime-500 to-transparent' :
        colorName === 'amber' ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' :
        colorName === 'zinc' ? 'bg-gradient-to-r from-transparent via-zinc-500 to-transparent' :
        'bg-gradient-to-r from-transparent via-zinc-500 to-transparent'
      }`}></div>
    </div>
  );
};

/**
 * Enhanced Admin Metric Component
 * Displays admin/debug metrics with active state and optional subtitle
 */
export const AdminMetric = ({ label, value, subtitle, icon, active = false }: AdminMetricProps) => {
  return (
    <div className={`p-3 flex flex-col items-start gap-1 transition-all duration-300 relative overflow-hidden group ${
      active
        ? 'bg-emerald-500/10 border border-emerald-500/20'
        : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
    }`}>
      {/* Active pulse effect */}
      {active && (
        <div className="absolute top-1 right-1 w-2 h-2">
          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
          <div className="absolute inset-0 bg-emerald-500 rounded-full"></div>
        </div>
      )}

      {/* Icon + Label */}
      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 uppercase font-bold">
        <div className="flex items-center justify-center">
          {icon}
        </div>
        {label}
      </div>

      {/* Value */}
      <div className={`text-sm font-mono font-bold transition-colors ${
        active ? 'text-emerald-500' : 'text-zinc-300 group-hover:text-zinc-200'
      }`}>
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-[10px] text-zinc-600 font-mono">
          {subtitle}
        </div>
      )}

      {/* Active glow effect */}
      {active && (
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
      )}
    </div>
  );
};
