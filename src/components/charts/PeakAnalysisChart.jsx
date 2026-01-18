import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Peak vs Off-Peak Analysis Component
 * Shows distribution of hits during peak hours (18:00-23:59) vs off-peak
 */
export default function PeakAnalysisChart({ peakAnalysis }) {
  if (!peakAnalysis) return null;

  return (
    <div className="bg-gradient-to-br from-orange-900/20 to-zinc-900 border border-orange-500/30 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-orange-400 uppercase mb-4 flex items-center gap-2">
        <Zap size={16} />
        Peak vs Off-Peak (18:00-23:59)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-950 p-4 rounded-xl">
          <div className="text-center mb-2">
            <p className="text-4xl font-bold text-orange-400">{peakAnalysis.peak}</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Peak Hits</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all"
              style={{ width: `${peakAnalysis.peakPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-2">{peakAnalysis.peakPercentage}%</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl">
          <div className="text-center mb-2">
            <p className="text-4xl font-bold text-blue-400">{peakAnalysis.offPeak}</p>
            <p className="text-xs text-zinc-600 uppercase mt-2">Off-Peak Hits</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${peakAnalysis.offPeakPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-2">{peakAnalysis.offPeakPercentage}%</p>
        </div>
      </div>
    </div>
  );
}
