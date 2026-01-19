import React from 'react';
import { Zap, Sunset, Moon } from 'lucide-react';

interface PeakAnalysis {
  peak: number;
  offPeak: number;
  peakPercentage: number;
  offPeakPercentage: number;
}

interface PeakAnalysisChartProps {
  peakAnalysis: PeakAnalysis | null;
}

/**
 * Enhanced Peak vs Off-Peak Analysis Component
 * Shows distribution of hits during peak hours (18:00-23:59) vs off-peak with visual comparison
 */
export default function PeakAnalysisChart({ peakAnalysis }: PeakAnalysisChartProps) {
  if (!peakAnalysis) return null;

  const total = peakAnalysis.peak + peakAnalysis.offPeak;
  const isPeakDominant = peakAnalysis.peak > peakAnalysis.offPeak;

  return (
    <div className="bg-gradient-to-br from-orange-900/10 to-zinc-900 border border-orange-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Zap size={16} className="text-orange-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-orange-300 uppercase">Peak vs Off-Peak</h3>
            <p className="text-xs text-zinc-500">18:00-23:59 Analyse</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-zinc-400">{total}</div>
          <div className="text-xs text-zinc-500">Gesamt</div>
        </div>
      </div>

      {/* Comparison visualization */}
      <div className="mb-6">
        <div className="h-12 flex rounded-xl overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-600 to-orange-400 flex items-center justify-center text-white font-bold text-sm transition-all duration-500 hover:from-orange-500 hover:to-orange-300"
            style={{ width: `${peakAnalysis.peakPercentage}%` }}
          >
            {peakAnalysis.peakPercentage > 15 && `${peakAnalysis.peakPercentage}%`}
          </div>
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm transition-all duration-500 hover:from-blue-500 hover:to-blue-300"
            style={{ width: `${peakAnalysis.offPeakPercentage}%` }}
          >
            {peakAnalysis.offPeakPercentage > 15 && `${peakAnalysis.offPeakPercentage}%`}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Peak */}
        <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-orange-500/30 transition-all group">
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-orange-500/10">
            <Sunset size={14} className="text-orange-400"/>
          </div>
          <div className="text-center mb-3">
            <p className="text-3xl font-bold text-orange-400 group-hover:scale-105 transition-transform">
              {peakAnalysis.peak}
            </p>
            <p className="text-xs text-zinc-500 uppercase mt-1 font-medium">Peak Hits</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${peakAnalysis.peakPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-xs text-orange-400 font-medium mt-2">
            {peakAnalysis.peakPercentage}%
          </p>
          {isPeakDominant && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500/20 px-2 py-0.5 rounded-full">
              <span className="text-[9px] text-orange-400 font-bold uppercase">Dominant</span>
            </div>
          )}
        </div>

        {/* Off-Peak */}
        <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/30 transition-all group">
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-blue-500/10">
            <Moon size={14} className="text-blue-400"/>
          </div>
          <div className="text-center mb-3">
            <p className="text-3xl font-bold text-blue-400 group-hover:scale-105 transition-transform">
              {peakAnalysis.offPeak}
            </p>
            <p className="text-xs text-zinc-500 uppercase mt-1 font-medium">Off-Peak Hits</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${peakAnalysis.offPeakPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-xs text-blue-400 font-medium mt-2">
            {peakAnalysis.offPeakPercentage}%
          </p>
          {!isPeakDominant && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500/20 px-2 py-0.5 rounded-full">
              <span className="text-[9px] text-blue-400 font-bold uppercase">Dominant</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
