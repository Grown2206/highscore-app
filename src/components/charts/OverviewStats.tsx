import React from 'react';
import { TrendingUp, Target, Calendar, Scale, BarChart3 } from 'lucide-react';

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
 * Enhanced Overview Statistics Component
 * Displays total hits, active days, total amount, and average per day with icons and animations
 */
export default function OverviewStats({ totalStats }: OverviewStatsProps) {
  const stats = [
    {
      value: totalStats.totalHits,
      label: 'Gesamt Hits',
      color: 'emerald',
      icon: Target,
      suffix: '',
      decimals: 0
    },
    {
      value: totalStats.activeDays,
      label: 'Aktive Tage',
      color: 'purple',
      icon: Calendar,
      suffix: '',
      decimals: 0
    },
    {
      value: totalStats.totalAmount,
      label: 'Gesamt Menge',
      color: 'lime',
      icon: Scale,
      suffix: 'g',
      decimals: 1
    },
    {
      value: totalStats.avgPerDay,
      label: 'Ø pro Tag',
      color: 'cyan',
      icon: BarChart3,
      suffix: '',
      decimals: 1
    }
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <TrendingUp size={16} className="text-emerald-400"/>
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-300 uppercase">Gesamt-Übersicht</h3>
          <p className="text-xs text-zinc-500">Alle Zeiten</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            emerald: 'text-emerald-400 bg-emerald-500/10',
            purple: 'text-purple-400 bg-purple-500/10',
            lime: 'text-lime-400 bg-lime-500/10',
            cyan: 'text-cyan-400 bg-cyan-500/10'
          };

          const displayValue = stat.decimals > 0
            ? stat.value.toFixed(stat.decimals)
            : stat.value.toString();

          return (
            <div
              key={stat.label}
              className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all duration-300 group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`absolute top-3 right-3 p-1.5 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon size={14} />
              </div>

              {/* Value */}
              <div className="mt-2">
                <p className={`text-3xl font-bold ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[0]} group-hover:scale-105 transition-transform`}>
                  {displayValue}{stat.suffix}
                </p>
                <p className="text-xs text-zinc-500 uppercase mt-2 font-medium">{stat.label}</p>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                stat.color === 'emerald' ? 'bg-emerald-500/5' :
                stat.color === 'purple' ? 'bg-purple-500/5' :
                stat.color === 'lime' ? 'bg-lime-500/5' :
                'bg-cyan-500/5'
              }`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
