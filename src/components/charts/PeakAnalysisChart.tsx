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
    <div
      className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border"
      style={{
        background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--accent-warning) 10%, transparent), var(--bg-secondary))',
        borderColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)' }}
          >
            <Zap size={16} style={{ color: 'var(--accent-warning)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase" style={{ color: 'var(--accent-warning)' }}>Peak vs Off-Peak</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>18:00-23:59 Analyse</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color: 'var(--text-secondary)' }}>{total}</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Gesamt</div>
        </div>
      </div>

      {/* Comparison visualization */}
      <div className="mb-6">
        <div className="h-12 flex rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
            style={{
              width: `${peakAnalysis.peakPercentage}%`,
              background: 'linear-gradient(to right, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 80%, white))',
            }}
          >
            {peakAnalysis.peakPercentage > 15 && `${peakAnalysis.peakPercentage}%`}
          </div>
          <div
            className="flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
            style={{
              width: `${peakAnalysis.offPeakPercentage}%`,
              background: 'linear-gradient(to right, var(--accent-info), color-mix(in srgb, var(--accent-info) 80%, white))',
            }}
          >
            {peakAnalysis.offPeakPercentage > 15 && `${peakAnalysis.offPeakPercentage}%`}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Peak */}
        <div
          className="relative rounded-xl p-4 transition-all group border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div
            className="absolute top-3 right-3 p-1.5 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)' }}
          >
            <Sunset size={14} style={{ color: 'var(--accent-warning)' }} />
          </div>
          <div className="text-center mb-3">
            <p
              className="text-3xl font-bold group-hover:scale-105 transition-transform"
              style={{ color: 'var(--accent-warning)' }}
            >
              {peakAnalysis.peak}
            </p>
            <p className="text-xs uppercase mt-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>Peak Hits</p>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${peakAnalysis.peakPercentage}%`,
                background: 'linear-gradient(to right, var(--accent-warning), color-mix(in srgb, var(--accent-warning) 80%, white))',
              }}
            ></div>
          </div>
          <p className="text-center text-xs font-medium mt-2" style={{ color: 'var(--accent-warning)' }}>
            {peakAnalysis.peakPercentage}%
          </p>
          {isPeakDominant && (
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)' }}
            >
              <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--accent-warning)' }}>Dominant</span>
            </div>
          )}
        </div>

        {/* Off-Peak */}
        <div
          className="relative rounded-xl p-4 transition-all group border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 50%, transparent)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div
            className="absolute top-3 right-3 p-1.5 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent-info) 10%, transparent)' }}
          >
            <Moon size={14} style={{ color: 'var(--accent-info)' }} />
          </div>
          <div className="text-center mb-3">
            <p
              className="text-3xl font-bold group-hover:scale-105 transition-transform"
              style={{ color: 'var(--accent-info)' }}
            >
              {peakAnalysis.offPeak}
            </p>
            <p className="text-xs uppercase mt-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>Off-Peak Hits</p>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${peakAnalysis.offPeakPercentage}%`,
                background: 'linear-gradient(to right, var(--accent-info), color-mix(in srgb, var(--accent-info) 80%, white))',
              }}
            ></div>
          </div>
          <p className="text-center text-xs font-medium mt-2" style={{ color: 'var(--accent-info)' }}>
            {peakAnalysis.offPeakPercentage}%
          </p>
          {!isPeakDominant && (
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-info) 20%, transparent)' }}
            >
              <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--accent-info)' }}>Dominant</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
