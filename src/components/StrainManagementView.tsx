import React, { useState, useMemo, memo } from 'react';
import { Plus, Edit2, Trash2, Tag, DollarSign, Leaf, TrendingUp, Star, Save, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Settings } from '../hooks/useHitManagement.ts';

interface StrainManagementViewProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

// **FIX v8.8**: Entferne sessionHits - Stats entfernt, nur noch CRUD
function StrainManagementView({ settings, setSettings }: StrainManagementViewProps) {
  const [form, setForm] = useState({ name: '', price: '10', thc: '15', type: 'hybrid', notes: '' });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formExpanded, setFormExpanded] = useState(false);

  // **FIX v8.8**: Keine Statistiken mehr, nur Basisdaten
  const strainStats = useMemo(() => {
    return settings.strains.map(strain => ({
      ...strain,
      totalHits: 0,
      totalCost: 0,
      lastUsed: null,
      isFavorite: false
    }));
  }, [settings.strains]);

  // Gefilterte und sortierte Sorten
  const filteredStrains = useMemo(() => {
    let filtered = strainStats;

    // Nach Typ filtern
    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.type === filterType);
    }

    // Nach Suchbegriff filtern
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // **FIX v8.8**: Nach Namen sortieren statt nach Beliebtheit
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [strainStats, filterType, searchTerm]);

  const save = () => {
    if (!form.name) return;
    if (navigator.vibrate) navigator.vibrate(50);

    setSettings(p => {
      const strain = {
        id: editId || Date.now(),
        name: form.name,
        price: parseFloat(form.price) || 0,
        thc: parseFloat(form.thc) || 0,
        type: form.type,
        notes: form.notes
      };
      return {
        ...p,
        strains: editId
          ? p.strains.map(s => s.id === editId ? strain : s)
          : [...p.strains, strain]
      };
    });

    setForm({ name: '', price: '10', thc: '15', type: 'hybrid', notes: '' });
    setEditId(null);
    setFormExpanded(false);
  };

  const edit = (s) => {
    if (navigator.vibrate) navigator.vibrate(20);
    setForm({
      name: s.name,
      price: s.price.toString(),
      thc: s.thc.toString(),
      type: s.type || 'hybrid',
      notes: s.notes || ''
    });
    setEditId(s.id);
    setFormExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = (id) => {
    if (navigator.vibrate) navigator.vibrate(20);
    if (!confirm('Sorte wirklich löschen?')) return;

    setSettings(p => ({
      ...p,
      strains: p.strains.filter(s => s.id !== id)
    }));

    if (editId === id) {
      setEditId(null);
      setForm({ name: '', price: '10', thc: '15', type: 'hybrid', notes: '' });
    }
  };

  const cancel = () => {
    setEditId(null);
    setForm({ name: '', price: '10', thc: '15', type: 'hybrid', notes: '' });
    setFormExpanded(false);
  };

  const getTypeStyle = (type) => {
    // Map strain types to theme-aware color styles
    const typeColors = {
      indica: 'var(--accent-info)',     // Purple/Blue for indica
      sativa: 'var(--accent-warning)',  // Yellow/Amber for sativa
      hybrid: 'var(--accent-primary)',  // Green for hybrid
      default: 'var(--text-tertiary)',
    };

    const color = typeColors[type] || typeColors.default;

    return {
      color: color,
      backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      borderColor: `color-mix(in srgb, ${color} 20%, transparent)`,
    };
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'indica': return '🌙'; // Entspannend
      case 'sativa': return '☀️'; // Energetisch
      case 'hybrid': return '⚖️'; // Ausgewogen
      default: return '🌿';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Tag style={{ color: 'var(--accent-primary)' }} />
        Sorten-Management
      </h2>

      {/* Formular zum Hinzufügen/Bearbeiten */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 20%, transparent), var(--bg-secondary))`,
          border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)',
        }}
      >
        {/* Header - immer sichtbar */}
        <button
          onClick={() => setFormExpanded(!formExpanded)}
          className="w-full p-4 flex items-center justify-between transition-colors"
          style={{
            backgroundColor: formExpanded ? 'color-mix(in srgb, var(--accent-primary) 5%, transparent)' : 'transparent',
          }}
        >
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-bold uppercase flex items-center gap-2"
              style={{ color: 'var(--accent-primary)' }}
            >
              {editId ? <Edit2 size={16} /> : <Plus size={16} />}
              {editId ? 'Sorte bearbeiten' : 'Neue Sorte'}
            </h3>
            {editId && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)',
                  color: 'var(--accent-primary)',
                }}
              >
                {form.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editId && (
              <button
                onClick={(e) => { e.stopPropagation(); cancel(); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={16} />
              </button>
            )}
            <div style={{ color: 'var(--accent-primary)' }}>
              {formExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </button>

        {/* Formular - nur wenn expanded */}
        {formExpanded && (
          <div className="p-6 pt-0 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl p-3 border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              placeholder="z.B. Lemon Haze"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
              Typ
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl p-3 border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
            >
              <option value="hybrid">🌿 Hybrid</option>
              <option value="indica">🌙 Indica</option>
              <option value="sativa">☀️ Sativa</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
              Preis (€/g)
            </label>
            <input
              type="number"
              step="0.5"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-xl p-3 border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
              THC (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={form.thc}
              onChange={(e) => setForm({ ...form, thc: e.target.value })}
              className="w-full rounded-xl p-3 border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              placeholder="15"
            />
          </div>

          <div className="col-span-full space-y-2">
            <label className="text-xs uppercase font-bold" style={{ color: 'var(--text-secondary)' }}>
              Notizen
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl p-3 border outline-none resize-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              rows={2}
              placeholder="Geschmack, Wirkung, etc..."
            />
          </div>
        </div>

            <button
              onClick={save}
              disabled={!form.name}
              className="w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: form.name ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: form.name ? 'white' : 'var(--text-tertiary)',
              }}
            >
              <Save size={18} />
              {editId ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        )}
      </div>

      {/* Filter und Suche */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2 text-sm border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              placeholder="Sorten durchsuchen..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{
                backgroundColor: filterType === 'all' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: filterType === 'all' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterType('indica')}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{
                backgroundColor: filterType === 'indica' ? 'var(--accent-info)' : 'var(--bg-tertiary)',
                color: filterType === 'indica' ? 'white' : 'var(--text-secondary)',
              }}
            >
              🌙 Indica
            </button>
            <button
              onClick={() => setFilterType('sativa')}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{
                backgroundColor: filterType === 'sativa' ? 'var(--accent-warning)' : 'var(--bg-tertiary)',
                color: filterType === 'sativa' ? 'white' : 'var(--text-secondary)',
              }}
            >
              ☀️ Sativa
            </button>
            <button
              onClick={() => setFilterType('hybrid')}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{
                backgroundColor: filterType === 'hybrid' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: filterType === 'hybrid' ? 'white' : 'var(--text-secondary)',
              }}
            >
              ⚖️ Hybrid
            </button>
          </div>
        </div>
      </div>

      {/* Sorten-Liste */}
      <div className="space-y-3">
        {filteredStrains.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <Leaf size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm || filterType !== 'all' ? 'Keine Sorten gefunden' : 'Noch keine Sorten angelegt'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {searchTerm || filterType !== 'all'
                ? 'Versuche eine andere Suche oder Filter'
                : 'Füge deine erste Sorte hinzu!'}
            </p>
          </div>
        ) : (
          filteredStrains.map((strain) => {
            const typeStyle = getTypeStyle(strain.type);

            return (
              <div
                key={strain.id}
                className="rounded-2xl p-4 transition-all"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Typ-Icon */}
                  <div
                    className="p-3 rounded-xl border"
                    style={typeStyle}
                  >
                    <span className="text-2xl">{getTypeIcon(strain.type)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {strain.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full border font-bold"
                            style={typeStyle}
                          >
                            {strain.type}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => edit(strain)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => del(strain.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--accent-error)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* **FIX v8.8**: Nur noch Basisinfo, keine Sessions/Costs mehr */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <p className="text-[10px] uppercase mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          Preis
                        </p>
                        <p className="text-sm font-bold" style={{ color: 'var(--accent-warning)' }}>
                          {strain.price.toFixed(2)}€/g
                        </p>
                      </div>
                      <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <p className="text-[10px] uppercase mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          THC
                        </p>
                        <p className="text-sm font-bold" style={{ color: 'var(--accent-info)' }}>
                          {strain.thc}%
                        </p>
                      </div>
                    </div>

                    {/* Notizen */}
                    {strain.notes && (
                      <div className="space-y-1">
                        <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                          {strain.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* **FIX v8.8**: Vereinfachte Gesamt-Übersicht ohne sessionHits-Stats */}
      {settings.strains.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))`,
            border: '1px solid var(--border-primary)',
          }}
        >
          <h3
            className="text-sm font-bold uppercase mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <TrendingUp size={16} />
            Gesamt-Übersicht
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                {settings.strains.length}
              </p>
              <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Sorten
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-warning)' }}>
                {(strainStats.reduce((sum, s) => sum + s.price, 0) / settings.strains.length).toFixed(2)}€
              </p>
              <p className="text-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Ø Preis
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(StrainManagementView);
