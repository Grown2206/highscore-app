import React, { useState } from 'react';
import { Settings, Shield, Tag, Coins, Zap, Edit2, Trash2, Check, Plus, X } from 'lucide-react';

export default function SettingsView({ settings, setSettings, liveTemp }) {
  const [form, setForm] = useState({ name: '', price: '10', thc: '15' });
  const [editId, setEditId] = useState(null);

  const upd = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  
  const save = () => {
    if(!form.name) return;
    if(navigator.vibrate) navigator.vibrate(50);
    setSettings(p => {
        const strain = { id: editId || Date.now(), name: form.name, price: parseFloat(form.price), thc: parseFloat(form.thc) };
        return { ...p, strains: editId ? p.strains.map(s => s.id === editId ? strain : s) : [...p.strains, strain] };
    });
    setForm({ name: '', price: '10', thc: '15' }); setEditId(null);
  };
  
  const edit = (s) => { if(navigator.vibrate) navigator.vibrate(20); setForm({ name: s.name, price: s.price, thc: s.thc }); setEditId(s.id); };
  const del = (id) => { if(navigator.vibrate) navigator.vibrate(20); setSettings(p => ({ ...p, strains: p.strains.filter(s => s.id !== id) })); if(editId===id) { setEditId(null); setForm({name:'',price:'10',thc:'15'}); } };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Einstellungen</h2>
      
      {/* BASIS BERECHNUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
         <h3 className="text-sm font-bold text-zinc-400 uppercase">Basis Berechnung</h3>
         <div className="space-y-4">
            <div className="flex justify-between text-xs"><span>Kopfgröße</span><span className="text-emerald-400 font-bold">{settings.bowlSize}g</span></div>
            <input type="range" min="0.1" max="1.5" step="0.05" value={settings.bowlSize} onChange={e => upd('bowlSize', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-emerald-500"/>
            <div className="flex justify-between text-xs"><span>Weed Anteil</span><span className="text-lime-400 font-bold">{settings.weedRatio}%</span></div>
            <input type="range" min="0" max="100" step="5" value={settings.weedRatio} onChange={e => upd('weedRatio', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-lime-500"/>
         </div>
         <div className="w-full h-px bg-zinc-800"></div>
         <div className="flex items-center justify-between pt-2">
           <div>
             <label className="flex items-center gap-2 text-white font-medium"><Shield size={20} className={settings.adminMode ? "text-rose-500" : "text-zinc-500"} />Admin Modus</label>
             <p className="text-xs text-zinc-500 mt-1 pl-7">Zeigt Diagnose-Daten im Dashboard.</p>
           </div>
           <button onClick={() => upd('adminMode', !settings.adminMode)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.adminMode ? 'bg-rose-500' : 'bg-zinc-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.adminMode ? 'left-7' : 'left-1'}`}></div>
           </button>
         </div>
      </div>

      {/* KALIBRIERUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
         <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2"><Settings size={14}/> Kalibrierung</h3>
         <div className="h-10 bg-zinc-950 rounded relative flex items-center px-2 border border-zinc-800 overflow-hidden">
             <div className="absolute inset-y-0 left-0 bg-emerald-500/20 transition-all" style={{width:`${Math.min(100, liveTemp)}%`}}/>
             <div className="absolute inset-y-0 w-0.5 bg-rose-500 z-10" style={{left:`${settings.triggerThreshold}%`}}/>
             <span className="relative z-20 text-xs font-mono font-bold text-white">{liveTemp.toFixed(1)}°C</span>
             <span className="absolute right-2 text-[10px] text-zinc-500">Trigger: {settings.triggerThreshold}°C</span>
         </div>
         <input type="range" min="20" max="100" value={settings.triggerThreshold} onChange={e => upd('triggerThreshold', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg accent-rose-500"/>
      </div>

      {/* SORTEN VERWALTUNG */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
         <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2"><Tag size={16}/> Sorten</h3>
         <div className="space-y-2 max-h-48 overflow-y-auto">
           {settings.strains.map(s => (
             <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border ${editId === s.id ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-950 border-zinc-800'}`}>
                <div><span className="font-bold text-white block text-sm">{s.name}</span><span className="text-[10px] text-zinc-500">{s.price}€/g • {s.thc}% THC</span></div>
                <div className="flex gap-2">
                   <button onClick={() => edit(s)} className={`p-2 rounded hover:bg-zinc-800 ${editId === s.id ? 'text-amber-500' : 'text-zinc-600'}`}><Edit2 size={14}/></button>
                   {settings.strains.length > 1 && <button onClick={() => del(s.id)} className="p-2 rounded hover:bg-rose-900/30 text-zinc-600 hover:text-rose-500"><Trash2 size={14}/></button>}
                </div>
             </div>
           ))}
         </div>
         <div className="flex gap-2 items-end bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
            <div className="flex-1 space-y-1"><label className="text-[9px] text-zinc-500 uppercase">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white"/></div>
            <div className="w-16 space-y-1"><label className="text-[9px] text-zinc-500 uppercase">€ / g</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white"/></div>
            <div className="w-12 space-y-1"><label className="text-[9px] text-zinc-500 uppercase">THC</label><input type="number" value={form.thc} onChange={e => setForm({...form, thc: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white"/></div>
            <button onClick={save} className={`p-2 rounded h-8 w-8 flex items-center justify-center text-white transition-colors ${editId ? 'bg-amber-600' : 'bg-emerald-600'}`}>{editId ? <Check size={14}/> : <Plus size={14}/>}</button>
            {editId && <button onClick={() => { setEditId(null); setForm({name:'',price:'10',thc:'15'}); }} className="bg-zinc-700 p-2 rounded h-8 w-8 flex items-center justify-center text-zinc-400"><X size={14}/></button>}
         </div>
      </div>
    </div>
  );
}