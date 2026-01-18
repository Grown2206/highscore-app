import { useState } from 'react';

export interface Hit {
  id: number | string;
  timestamp: number;
  type: string;
  strainName: string;
  strainPrice: number;
  strainId: number;
  duration?: number;
  bowlSize?: number;
  weedRatio?: number;
}

export interface HitSelectionState {
  selectMode: boolean;
  selectedHits: Set<number | string>;
  toggleSelectMode: () => void;
  toggleHitSelection: (hitId: number | string) => void;
  selectAllHits: (hits: Hit[]) => void;
  clearSelection: () => void;
}

/**
 * Custom hook for managing multi-select state in hit lists
 * Reduces duplication between DashboardView and CalendarView
 */
export function useHitSelection(): HitSelectionState {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedHits, setSelectedHits] = useState<Set<number | string>>(new Set());

  const toggleSelectMode = () => {
    setSelectMode(prev => !prev); // Functional update to avoid stale closures
    setSelectedHits(new Set()); // Clear selection when toggling mode
  };

  const toggleHitSelection = (hitId: number | string) => {
    setSelectedHits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hitId)) {
        newSet.delete(hitId);
      } else {
        newSet.add(hitId);
      }
      return newSet;
    });
  };

  const selectAllHits = (hits: Hit[]) => {
    setSelectedHits(new Set(hits.map(h => h.id)));
  };

  const clearSelection = () => {
    setSelectedHits(new Set());
    setSelectMode(false);
  };

  return {
    selectMode,
    selectedHits,
    toggleSelectMode,
    toggleHitSelection,
    selectAllHits,
    clearSelection
  };
}
