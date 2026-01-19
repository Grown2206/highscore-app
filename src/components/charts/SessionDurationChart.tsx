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
      color: 'cyan',
      icon: Clock,
      isHighlight: false
    },
    {
      value: durationStats.max,
      label: 'Längste',
      suffix: 's',
      color: 'blue',
      icon: TrendingUp,
      isHighlight: true
    },
    {
      value: durationStats.min,
      label: 'Kürzeste',
      suffix: 's',
      color: 'purple',
      icon: TrendingDown,
      isHighlight: true
    },
    {
      value: durationStats.count,
      label: 'Sensor Hits',
      suffix: '',
      color: 'emerald',
      icon: Activity,
      isHighlight: false
    }
  ];

  // Calculate range
  const range = durationStats.max - durationStats.min;

  return (
    <div className="bg-gradient-to-br from-cyan-900/10 to-zinc-900 border border-cyan-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <Timer size={16} className="text-cyan-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-cyan-300 uppercase">Session Dauer</h3>
            <p className="text-xs text-zinc-500">Sensor Statistiken</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-cyan-400">{range.toFixed(1)}s</div>
          <div className="text-xs text-zinc-500">Spannweite</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          };

          const glowClasses = {
            cyan: 'bg-cyan-500/5',
            blue: 'bg-blue-500/5',
            purple: 'bg-purple-500/5',
            emerald: 'bg-emerald-500/5'
          };

          return (
            <div
              key={stat.label}
              className={`relative bg-zinc-900/50 border rounded-xl p-4 hover:border-opacity-50 transition-all duration-300 group ${
                colorClasses[stat.color as keyof typeof colorClasses].split(' ').slice(2).join(' ')
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`absolute top-3 right-3 p-1.5 rounded-lg ${
                colorClasses[stat.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')
              }`}>
                <Icon size={12} />
              </div>

              {/* Value */}
              <div className="mt-2">
                <p className={`text-2xl font-bold ${
                  colorClasses[stat.color as keyof typeof colorClasses].split(' ')[0]
                } group-hover:scale-105 transition-transform`}>
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-xs text-zinc-500 uppercase mt-2 font-medium">{stat.label}</p>
              </div>

              {/* Visual indicator for min/max */}
              {stat.isHighlight && (
                <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.label === 'Längste'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 w-full'
                        : 'bg-gradient-to-r from-purple-600 to-purple-400'
                    }`}
                    style={{
                      width: stat.label === 'Kürzeste' ? `${(durationStats.min / durationStats.max) * 100}%` : '100%'
                    }}
                  ></div>
                </div>
              )}

              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                glowClasses[stat.color as keyof typeof glowClasses]
              }`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
