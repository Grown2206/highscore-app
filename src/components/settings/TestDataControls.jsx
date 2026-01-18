import React from 'react';
import { Database, Trash } from 'lucide-react';
import StatusAlert from '../common/StatusAlert';

/**
 * Test Data Controls Component (Admin only)
 * Generate and manage test data for testing analytics
 * Note: Parent component (SettingsView) should gate rendering based on adminMode
 */
export default function TestDataControls({
  testDataStatus,
  onAddTestData,
  onClearTestData
}) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-indigo-400"/>
        <h3 className="text-sm font-bold text-indigo-400 uppercase">Testdaten (Admin)</h3>
      </div>

      {testDataStatus && (
        <StatusAlert type={testDataStatus.type}>
          {testDataStatus.msg}
        </StatusAlert>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            onClick={() => onAddTestData(7)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
          >
            7 Tage
          </button>
          <button
            onClick={() => onAddTestData(30)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
          >
            30 Tage
          </button>
          <button
            onClick={() => onAddTestData(90)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors text-sm font-medium"
          >
            90 Tage
          </button>
        </div>

        <button
          onClick={onClearTestData}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl transition-colors font-medium"
        >
          <Trash size={18} />
          Alle Testdaten Löschen
        </button>
      </div>

      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3">
        <p className="text-[10px] text-indigo-300 leading-relaxed">
          <strong>Hinweis:</strong> Testdaten simulieren realistische Sessions über mehrere Tage.
          Sie werden mit "test_" IDs markiert und können jederzeit wieder entfernt werden.
          Perfekt zum Testen der Analytics, Charts und Statistiken!
        </p>
      </div>
    </div>
  );
}
