import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Session Duration Statistics Component
 * Displays average, max, min session duration from sensor data
 */
export default function SessionDurationChart({ durationStats }) {
  if (!durationStats) return null;

  return (
    <div className="bg-gradient-to-br from-cyan-900/20 to-zinc-900 border border-cyan-500/30 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-cyan-400 uppercase mb-4 flex items-center gap-2">
        <Clock size={16} />
        Session Dauer (Sensor)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-cyan-400">{durationStats.avg.toFixed(1)}s</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Ø Dauer</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-400">{durationStats.max}s</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Längste</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-400">{durationStats.min}s</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Kürzeste</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-400">{durationStats.count}</p>
          <p className="text-xs text-zinc-600 uppercase mt-2">Sensor Hits</p>
        </div>
      </div>
    </div>
  );
}
