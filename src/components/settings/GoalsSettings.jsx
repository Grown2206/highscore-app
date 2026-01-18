import React from 'react';
import { Target } from 'lucide-react';

/**
 * Goals Settings Component
 * Daily limit and T-break reminder configuration
 */
export default function GoalsSettings({ goals, setGoals }) {
  if (!setGoals) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-blue-500"/>
        <h3 className="text-sm font-bold text-zinc-400 uppercase">Ziele</h3>
      </div>

      <div className="space-y-3">
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <label className="text-xs text-zinc-500 uppercase block mb-2">Tägliches Limit</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="50"
              value={goals?.dailyLimit || 0}
              onChange={(e) => setGoals(p => ({ ...p, dailyLimit: parseInt(e.target.value, 10) || 0 }))}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono"
            />
            <span className="text-sm text-zinc-500">Hits/Tag</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">0 = kein Limit</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <label className="text-xs text-zinc-500 uppercase block mb-2">T-Break Erinnerung</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="30"
              value={goals?.tBreakDays || 0}
              onChange={(e) => setGoals(p => ({ ...p, tBreakDays: parseInt(e.target.value, 10) || 0 }))}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono"
            />
            <span className="text-sm text-zinc-500">Tage</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">Erinnerung nach X Tagen ohne Pause</p>
        </div>
      </div>
    </div>
  );
}
