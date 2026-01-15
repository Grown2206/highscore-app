import { useState } from 'react';

/**
 * Custom hook for managing multi-select state in hit lists
 * Reduces duplication between DashboardView and CalendarView
 */
export function useHitSelection() {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedHits, setSelectedHits] = useState(new Set());

  const toggleSelectMode = () => {
    setSelectMode(prev => !prev); // Functional update to avoid stale closures
    setSelectedHits(new Set()); // Clear selection when toggling mode
  };

  const toggleHitSelection = (hitId) => {
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

  const selectAllHits = (hits) => {
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
