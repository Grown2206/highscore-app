import React from 'react';
import { TrendingUp, Target, Calendar, Scale, BarChart3 } from 'lucide-react';
import ChartCard from './ChartCard';

interface TotalStats {
  totalHits: number;
  activeDays: number;
  totalAmount: number;
  avgPerDay: number;
}

interface OverviewStatsProps {
  totalStats: TotalStats;
}

/**
 * Enhanced Overview Statistics Component (v8.2 - Theme Support)
 * Displays total hits, active days, total amount, and average per day with icons and animations
 */
export default function OverviewStats({ totalStats }: OverviewStatsProps) {
  const stats = [
    {
      value: totalStats.totalHits,
      label: 'Gesamt Hits',
      variant: 'primary' as const,
      icon: Target,
      suffix: '',
      decimals: 0,
    },
    {
      value: totalStats.activeDays,
      label: 'Aktive Tage',
      variant: 'secondary' as const,
      icon: Calendar,
      suffix: '',
      decimals: 0,
    },
    {
      value: totalStats.totalAmount,
      label: 'Gesamt Menge',
      variant: 'tertiary' as const,
      icon: Scale,
      suffix: 'g',
      decimals: 1,
    },
    {
      value: totalStats.avgPerDay,
      label: 'Ø pro Tag',
      variant: 'success' as const,
      icon: BarChart3,
      suffix: '',
      decimals: 1,
    },
  ];

  const getVariantColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'success') => {
    switch (variant) {
      case 'primary':
        return 'var(--chart-primary)';
      case 'secondary':
        return 'var(--chart-secondary)';
      case 'tertiary':
        return 'var(--chart-tertiary)';
      case 'success':
        return 'var(--accent-success)';
    }
  };

  return (
    <ChartCard
      title="Gesamt-Übersicht"
      subtitle="Alle Zeiten"
      icon={TrendingUp}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const variantColor = getVariantColor(stat.variant);

          const displayValue =
            stat.decimals > 0 ? stat.value.toFixed(stat.decimals) : stat.value.toString();

          return (
            <div
              key={stat.label}
              className="relative rounded-xl p-4 transition-all duration-300 group"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              {/* Icon */}
              <div
                className="absolute top-3 right-3 p-1.5 rounded-lg"
                style={{
                  backgroundColor: `color-mix(in srgb, ${variantColor} 10%, transparent)`,
                  color: variantColor,
                }}
              >
                <Icon size={14} />
              </div>

              {/* Value */}
              <div className="mt-2">
                <p
                  className="text-3xl font-bold group-hover:scale-105 transition-transform"
                  style={{ color: variantColor }}
                >
                  {displayValue}
                  {stat.suffix}
                </p>
                <p
                  className="text-xs uppercase mt-2 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {stat.label}
                </p>
              </div>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  backgroundColor: `color-mix(in srgb, ${variantColor} 5%, transparent)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
