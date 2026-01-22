import React from 'react';
import { Clock, Timer, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface DurationStats {
  avg: number;
  max: number;
  min: number;
  count: number;
}

interface SessionDurationChartProps {
  durationStats: DurationStats | null;
}

/**
 * Enhanced Session Duration Statistics Component
 * Displays average, max, min session duration from sensor data with visual indicators
 */
export default function SessionDurationChart({ durationStats }: SessionDurationChartProps) {
  if (!durationStats) return null;

  const stats = [
    {
      value: durationStats.avg.toFixed(1),
      label: 'Ø Dauer',
      suffix: 's',
      colorVar: '--accent-primary',
      icon: Clock,
      isHighlight: false
    },
    {
      value: durationStats.max,
      label: 'Längste',
      suffix: 's',
      colorVar: '--accent-info',
      icon: TrendingUp,
      isHighlight: true
    },
    {
      value: durationStats.min,
      label: 'Kürzeste',
      suffix: 's',
      colorVar: '--accent-secondary',
      icon: TrendingDown,
      isHighlight: true
    },
    {
      value: durationStats.count,
      label: 'Sensor Hits',
      suffix: '',
      colorVar: '--accent-success',
      icon: Activity,
      isHighlight: false
    }
  ];

  // Calculate range
  const range = durationStats.max - durationStats.min;

  return (
    <div
      className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border"
      style={{
        background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-primary) 10%, transparent), var(--bg-secondary))',
        borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }}
          >
            <Timer size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-primary)' }}>Session Dauer</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sensor Statistiken</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>{range.toFixed(1)}s</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Spannweite</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="relative rounded-xl p-4 transition-all duration-300 group border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)',
                borderColor: `color-mix(in srgb, var(${stat.colorVar}) 20%, transparent)`,
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              {/* Icon */}
              <div
                className="absolute top-3 right-3 p-1.5 rounded-lg"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${stat.colorVar}) 10%, transparent)`,
                }}
              >
                <Icon size={12} style={{ color: `var(${stat.colorVar})` }} />
              </div>

              {/* Value */}
              <div className="mt-2">
                <p
                  className="text-2xl font-bold group-hover:scale-105 transition-transform"
                  style={{ color: `var(${stat.colorVar})` }}
                >
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-xs uppercase mt-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {stat.label}
                </p>
              </div>

              {/* Visual indicator for min/max */}
              {stat.isHighlight && (
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: stat.label === 'Kürzeste' ? `${(durationStats.min / durationStats.max) * 100}%` : '100%',
                      background:
                        stat.label === 'Längste'
                          ? 'linear-gradient(to right, var(--accent-info), color-mix(in srgb, var(--accent-info) 80%, white))'
                          : 'linear-gradient(to right, var(--accent-secondary), color-mix(in srgb, var(--accent-secondary) 80%, white))',
                    }}
                  ></div>
                </div>
              )}

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ backgroundColor: `color-mix(in srgb, var(${stat.colorVar}) 5%, transparent)` }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
