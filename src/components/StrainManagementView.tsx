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

  const getTypeColor = (type) => {
    switch(type) {
      case 'indica': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'sativa': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'hybrid': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
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
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Tag className="text-emerald-500" />
        Sorten-Management
      </h2>

      {/* Formular zum Hinzufügen/Bearbeiten */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/30 rounded-2xl overflow-hidden">
        {/* Header - immer sichtbar */}
        <button
          onClick={() => setFormExpanded(!formExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-emerald-500/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase flex items-center gap-2">
              {editId ? <Edit2 size={16} /> : <Plus size={16} />}
              {editId ? 'Sorte bearbeiten' : 'Neue Sorte'}
            </h3>
            {editId && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                {form.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editId && (
              <button
                onClick={(e) => { e.stopPropagation(); cancel(); }}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <div className="text-emerald-500">
              {formExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </button>

        {/* Formular - nur wenn expanded */}
        {formExpanded && (
          <div className="p-6 pt-0 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
              placeholder="z.B. Lemon Haze"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold">Typ</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
            >
              <option value="hybrid">🌿 Hybrid</option>
              <option value="indica">🌙 Indica</option>
              <option value="sativa">☀️ Sativa</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold">Preis (€/g)</label>
            <input
              type="number"
              step="0.5"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold">THC (%)</label>
            <input
              type="number"
              step="0.5"
              value={form.thc}
              onChange={(e) => setForm({ ...form, thc: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
              placeholder="15"
            />
          </div>

          <div className="col-span-full space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold">Notizen</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none resize-none"
              rows={2}
              placeholder="Geschmack, Wirkung, etc..."
            />
          </div>
        </div>

            <button
              onClick={save}
              disabled={!form.name}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {editId ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        )}
      </div>

      {/* Filter und Suche */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
              placeholder="Sorten durchsuchen..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterType('indica')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filterType === 'indica'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              🌙 Indica
            </button>
            <button
              onClick={() => setFilterType('sativa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filterType === 'sativa'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              ☀️ Sativa
            </button>
            <button
              onClick={() => setFilterType('hybrid')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filterType === 'hybrid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              ⚖️ Hybrid
            </button>
          </div>
        </div>
      </div>

      {/* Sorten-Liste */}
      <div className="space-y-3">
        {filteredStrains.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <Leaf size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 mb-2">
              {searchTerm || filterType !== 'all' ? 'Keine Sorten gefunden' : 'Noch keine Sorten angelegt'}
            </p>
            <p className="text-xs text-zinc-600">
              {searchTerm || filterType !== 'all'
                ? 'Versuche eine andere Suche oder Filter'
                : 'Füge deine erste Sorte hinzu!'}
            </p>
          </div>
        ) : (
          filteredStrains.map((strain) => (
            <div
              key={strain.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Typ-Icon */}
                <div className={`p-3 rounded-xl border ${getTypeColor(strain.type)}`}>
                  <span className="text-2xl">{getTypeIcon(strain.type)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-white truncate">{strain.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${getTypeColor(strain.type)}`}>
                          {strain.type}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => edit(strain)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => del(strain.id)}
                        className="p-2 bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* **FIX v8.8**: Nur noch Basisinfo, keine Sessions/Costs mehr */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-zinc-950 rounded-lg p-2">
                      <p className="text-[10px] text-zinc-600 uppercase mb-0.5">Preis</p>
                      <p className="text-sm font-bold text-amber-400">{strain.price.toFixed(2)}€/g</p>
                    </div>
                    <div className="bg-zinc-950 rounded-lg p-2">
                      <p className="text-[10px] text-zinc-600 uppercase mb-0.5">THC</p>
                      <p className="text-sm font-bold text-purple-400">{strain.thc}%</p>
                    </div>
                  </div>

                  {/* Notizen */}
                  {strain.notes && (
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500 italic">{strain.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* **FIX v8.8**: Vereinfachte Gesamt-Übersicht ohne sessionHits-Stats */}
      {settings.strains.length > 0 && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
            <TrendingUp size={16} />
            Gesamt-Übersicht
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{settings.strains.length}</p>
              <p className="text-xs text-zinc-600 uppercase mt-1">Sorten</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">
                {(strainStats.reduce((sum, s) => sum + s.price, 0) / settings.strains.length).toFixed(2)}€
              </p>
              <p className="text-xs text-zinc-600 uppercase mt-1">Ø Preis</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(StrainManagementView);
