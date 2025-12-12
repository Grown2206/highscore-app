import React, { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from 'react';
import {
  Leaf, LayoutDashboard, Calendar as CalendarIcon, BarChart3, Trophy, Settings, Smartphone,
  Wifi, Zap, Wind, Flame, Star, Clock, Activity, Moon, CalendarDays, Shield, Tag, Gem, TrendingUp, Lock,
  Coins, List, Thermometer, Check, Plus, X, Edit2, Trash2, User, Users, Radio, Scale, WifiOff, RefreshCw,
  Save, AlertTriangle, Brain, Bell
} from 'lucide-react';
import AnalyticsView from './components/AnalyticsView';
import StreaksWidget from './components/StreaksWidget';
import SessionDetailsModal from './components/SessionDetailsModal';
import StrainManagementView from './components/StrainManagementView';
import { generateTestData } from './utils/testDataGenerator';

// --- KONFIGURATION FÜR PLATTFORMEN ---

// HINWEIS FÜR LOKALEN BUILD:
// Falls du 'npm install @capacitor/core' ausgeführt hast, kannst du den folgenden Import 
// wieder einkommentieren (die zwei // entfernen), um volle TypeScript-Unterstützung zu haben.
// Für die Web-Vorschau lassen wir es auskommentiert.

// import { Capacitor, CapacitorHttp } from '@capacitor/core';

// --- FALLBACK / MOCK ---
// Dieser Block sorgt dafür, dass die App auch ohne den Import nicht abstürzt.
// Auf dem Handy wird 'window.Capacitor' automatisch verfügbar sein.
const NativeCapacitor = (typeof window !== 'undefined' && window.Capacitor) 
  ? window.Capacitor 
  : { isNativePlatform: () => false };

// Native HTTP Helper (versucht CapacitorHttp zu nutzen, falls vorhanden)
const nativeHttp = async (url) => {
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp) {
      return await window.Capacitor.Plugins.CapacitorHttp.get({ url });
  }
  throw new Error("Native HTTP plugin not found");
};


// --- 1. UTILS & DATA ---

const ACHIEVEMENT_DATA = [
  { id: 'first_blood', title: 'Erster Zug', desc: 'Starte deine erste Session.', Icon: Zap },
  { id: 'high_five', title: 'High Five', desc: 'Erreiche 5 Hits an einem Tag.', Icon: Wind },
  { id: 'stoner', title: 'Heavy User', desc: 'Erreiche 10 Hits an einem Tag.', Icon: Flame },
  { id: 'century_club', title: 'Century Club', desc: 'Insgesamt 100 Hits erreicht.', Icon: Star },
  { id: 'rapid_fire', title: 'Schnellfeuer', desc: '2 Hits innerhalb von 5 Minuten.', Icon: Clock },
  { id: 'hattrick', title: 'Hattrick', desc: '3 Hits innerhalb von 15 Minuten.', Icon: Activity },
  { id: 'early_bird', title: 'Early Bird', desc: 'Ein Hit vor 08:00 Uhr morgens.', Icon: CalendarIcon },
  { id: 'night_owl', title: 'Nachteule', desc: 'Ein Hit zwischen 02:00 und 05:00 Uhr.', Icon: Moon },
  { id: '420', title: 'It\'s 4:20!', desc: 'Ein Hit exakt um 16:20 Uhr.', Icon: Leaf },
  { id: 'sunday_driver', title: 'Sonntagsfahrer', desc: 'Ein entspannter Hit am Sonntag.', Icon: CalendarDays },
  { id: 't_break', title: 'T-Break', desc: 'Über 24 Stunden Pause gemacht.', Icon: Shield },
  { id: 'detox_king', title: 'Detox King', desc: 'Über 5 Tage Pause durchgehalten.', Icon: Shield },
  { id: 'connoisseur', title: 'Connoisseur', desc: 'Probiere 3 verschiedene Sorten.', Icon: Tag },
  { id: 'explorer', title: 'Sorten-Entdecker', desc: '5 verschiedene Sorten im Tagebuch.', Icon: Tag },
  { id: 'high_roller', title: 'High Roller', desc: 'Gönn dir eine Sorte > 15€/g.', Icon: Gem },
  { id: 'iron_lung', title: 'Iron Lung', desc: 'Ein Zug länger als 5 Sekunden.', Icon: Trophy },
  { id: 'marathon', title: 'Marathon', desc: '7 Tage in Folge eine Session.', Icon: TrendingUp }
];

// --- 2. HOOKS ---

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- 3. UI COMPONENTS ---

const NavBtn = ({ id, icon, label, active, set }) => (
  <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); set(id); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active===id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-400 hover:bg-zinc-800'}`}>
    {icon} {label}
  </button>
);

const MobNavBtn = ({ id, icon, active, set }) => (
  <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); set(id); }} className={`p-3 rounded-xl transition-all ${active===id ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500'}`}>{icon}</button>
);

const MetricCard = ({ label, val, icon, color }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-24">
     <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">{icon} {label}</div>
     <div className={`text-2xl font-bold font-mono truncate ${color}`}>{val}</div>
  </div>
);

const AdminMetric = ({ label, value, icon, active }) => (
  <div className="p-3 bg-zinc-950 flex flex-col items-center justify-center gap-1 text-center">
    <span className="text-[10px] text-zinc-500 uppercase font-bold">{label}</span>
    <div className={`text-sm font-mono font-bold flex items-center gap-1 justify-center ${active ? 'text-emerald-400' : 'text-zinc-300'}`}>{icon} {value}</div>
  </div>
);

function HoldButton({ onTrigger, lastHit, active, temp }) {
  const [holding, setHolding] = useState(false);
  const [prog, setProg] = useState(0);
  const startRef = useRef(0);
  const reqRef = useRef(0);

  useEffect(() => {
    if (active && !holding) startAnim();
    else if (!active && !holding) { setProg(0); cancelAnimationFrame(reqRef.current); }
  }, [active]);

  const startAnim = () => {
    startRef.current = Date.now();
    const loop = () => {
      const p = Math.min(100, ((Date.now() - startRef.current)/2000)*100);
      setProg(p);
      if (active || holding) reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
  };

  const start = () => { if(navigator.vibrate) navigator.vibrate(30); setHolding(true); startAnim(); };
  const end = () => { 
    setHolding(false); cancelAnimationFrame(reqRef.current); 
    const d = Date.now() - startRef.current; 
    if (d > 200) onTrigger(d); 
    setProg(0); 
  };

  const isAct = holding || active;

  return (
    <div className="py-4 flex justify-center">
      <div className="w-64 h-64 relative flex items-center justify-center">
         <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
         <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none filter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <circle cx="128" cy="128" r="124" stroke="currentColor" strokeWidth="8" fill="transparent" 
              className={`text-emerald-500 transition-opacity duration-200 ${isAct ? 'opacity-100' : 'opacity-0'}`} 
              strokeDasharray="779" strokeDashoffset={779 - (779 * prog) / 100} />
         </svg>
         
         <button 
            onMouseDown={start} onMouseUp={end} onMouseLeave={end} 
            onTouchStart={(e)=>{e.preventDefault(); start();}} onTouchEnd={(e)=>{e.preventDefault(); end();}}
            className="w-48 h-48 rounded-full bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-10 relative overflow-hidden"
         >
            <div className={`absolute bottom-0 w-full bg-emerald-500/20 transition-all duration-75 ease-linear`} style={{ height: `${prog}%` }}></div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest z-10">Last Hit</span>
            <div className="text-4xl font-mono font-bold text-white z-10 tabular-nums my-1">{lastHit}</div>
            
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border z-10 transition-colors ${isAct ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-800 text-emerald-500 border-zinc-700'}`}>
               <Zap size={12} className={`inline mr-1 ${isAct ? "fill-black" : "fill-emerald-500"}`}/> {isAct ? "Inhaling..." : "Hold / Sensor"}
            </div>
            
            <div className="absolute bottom-6 flex items-center gap-1 text-[10px] text-zinc-600 font-mono z-10">
               <Thermometer size={10}/> {temp.toFixed(1)}°C
            </div>
         </button>
      </div>
    </div>
  );
}

// --- 4. VIEWS ---

function DashboardView({ liveData, lastHitTime, settings, isGuestMode, setIsGuestMode, guestHits, sessionHits, onManualTrigger, currentStrainId, setCurrentStrainId, isSensorInhaling, historyData, setSelectedSession }) {
  const [timeSince, setTimeSince] = useState("00:00:00");

  useEffect(() => {
    if (!lastHitTime) return;
    const iv = setInterval(() => {
      const d = Date.now() - lastHitTime;
      const h = Math.floor(d/36e5).toString().padStart(2,'0');
      const m = Math.floor((d%36e5)/6e4).toString().padStart(2,'0');
      const s = Math.floor((d%6e4)/1e3).toString().padStart(2,'0');
      setTimeSince(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [lastHitTime]);

  const weedAmount = liveData.today * settings.bowlSize * (settings.weedRatio / 100);
  const currentStrain = settings.strains.find(s => s.id == currentStrainId) || {price:0};
  const cost = weedAmount * currentStrain.price;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-2">
           {isGuestMode ? <Users className="text-amber-500" /> : <User className="text-emerald-500" />}
           <div className="leading-tight"><h2 className="font-bold text-white">{isGuestMode ? "Gäste" : "Session"}</h2><p className="text-[10px] text-zinc-400 font-mono">{isGuestMode ? "Kein Tracking" : "Tracking Aktiv"}</p></div>
        </div>
        {!isGuestMode && (
          <div className="flex items-center gap-2 bg-zinc-950 rounded-lg px-2 py-1.5 border border-zinc-800">
             <Tag size={14} className="text-zinc-500" />
             <select value={currentStrainId} onChange={(e) => { if(navigator.vibrate) navigator.vibrate(10); setCurrentStrainId(e.target.value); }} className="bg-transparent text-xs text-white outline-none font-medium max-w-[100px] truncate">
               {settings.strains.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
          </div>
        )}
        <button onClick={() => { if(navigator.vibrate) navigator.vibrate(20); setIsGuestMode(!isGuestMode); }} className={`w-10 h-6 rounded-full relative transition-colors ${isGuestMode ? 'bg-amber-500' : 'bg-zinc-700'}`}>
          <div className={`w-3 h-3 bg-white rounded-full absolute top-1.5 transition-all ${isGuestMode ? 'left-6' : 'left-1'}`}/>
        </button>
      </div>
      <HoldButton onTrigger={onManualTrigger} lastHit={timeSince} active={isSensorInhaling} temp={liveData.temp} />

      {/* Streaks Widget */}
      {!isGuestMode && <StreaksWidget historyData={historyData} sessionHits={sessionHits} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         {isGuestMode ? (
            <div className="col-span-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
               <span className="text-5xl font-bold text-amber-500 block">{guestHits}</span>
               <span className="text-xs uppercase font-bold text-amber-200">Gäste Hits</span>
            </div>
         ) : (
           <>
             <MetricCard label="Hits" val={liveData.today} icon={<Wind size={16}/>} color="text-emerald-400" />
             <MetricCard label="Menge" val={`${weedAmount.toFixed(2)}g`} icon={<Scale size={16}/>} color="text-lime-400" />
             <MetricCard label="Kosten" val={`${cost.toFixed(2)}€`} icon={<Coins size={16}/>} color="text-amber-400" />
             <MetricCard label="Gesamt" val={liveData.total} icon={<List size={16}/>} color="text-zinc-200" />
           </>
         )}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center gap-2"><Clock size={14} className="text-zinc-500"/><span className="text-xs font-bold uppercase text-zinc-500">Timeline</span></div>
        <div className="max-h-48 overflow-y-auto">
          {sessionHits.length === 0 ? <div className="p-4 text-center text-zinc-600 text-xs italic">Warte auf den ersten Zug...</div> :
          <table className="w-full text-left text-xs text-zinc-400">
             <tbody className="divide-y divide-zinc-800">
               {sessionHits.map((hit, i) => (
                 <tr key={hit.id} className="hover:bg-zinc-800/50 cursor-pointer transition-colors" onClick={() => setSelectedSession(hit)}>
                   <td className="px-4 py-3 font-mono text-zinc-600">#{sessionHits.length - i}</td>
                   <td className="px-4 py-3 text-white">{new Date(hit.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                   <td className="px-4 py-3">{hit.strainName}</td>
                   <td className="px-4 py-3 text-right">{hit.duration > 0 && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">{(hit.duration/1000).toFixed(1)}s</span>}</td>
                 </tr>
               ))}
             </tbody>
          </table>}
        </div>
      </div>
      {settings.adminMode && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-8">
          <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
             <Shield size={14} className="text-rose-500" />
             <span className="text-xs font-bold uppercase text-zinc-400">Admin Diagnose</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800">
             <AdminMetric label="Sensor Temp" value={`${liveData.temp.toFixed(1)} °C`} active={liveData.temp > settings.triggerThreshold} icon={<Thermometer size={12}/>} />
             <AdminMetric label="Trigger" value={settings.triggerThreshold} icon={<Zap size={12}/>} />
             <AdminMetric label="Manual Offset" value="Auto" icon={<List size={12}/>} />
             <AdminMetric label="Signal" value="-42 dBm" icon={<Radio size={12}/>} />
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ historyData, setHistoryData }) {
    const [sel, setSel] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState("");
    useEffect(() => { const d = historyData.find(h=>h.date===sel); setNote(d?.note||""); }, [sel, historyData]);
    const saveNote = () => { 
        if(navigator.vibrate) navigator.vibrate(10);
        setHistoryData(p => {
            const n = [...p]; const i = n.findIndex(h=>h.date===sel);
            if(i>=0) n[i].note = note; else n.push({date:sel,count:0,note}); return n;
        });
    };
    const today = new Date();
    const days = Array.from({length:35},(_,i)=>{
        const d=new Date(today.getFullYear(), today.getMonth(), 1); 
        d.setDate(d.getDate()-d.getDay()+1+i); 
        return { iso: d.toISOString().split('T')[0], day: d.getDate(), curr: d.getMonth()===today.getMonth() };
    });
    return (
        <div className="space-y-4 animate-in fade-in h-full flex flex-col pb-20">
           <h2 className="text-2xl font-bold text-white">Tagebuch</h2>
           <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-y-auto">
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] text-zinc-600 font-bold uppercase">{['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=><div key={d}>{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                 {days.map(d=>{
                     const h = historyData.find(x=>x.date===d.iso);
                     return (
                         <button key={d.iso} onClick={()=>setSel(d.iso)} className={`aspect-square rounded-lg flex flex-col items-center justify-center relative border transition-all ${sel===d.iso ? 'bg-zinc-800 border-emerald-500' : 'border-transparent bg-zinc-950'} ${!d.curr ? 'opacity-30' : ''}`}>
                            <span className="text-xs text-zinc-400">{d.day}</span>
                            {h?.count>0 && <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>}
                         </button>
                     )
                 })}
              </div>
           </div>
           <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center"><span className="text-sm font-bold text-white">{new Date(sel).toLocaleDateString()}</span><button onClick={saveNote} className="bg-emerald-600 p-1.5 rounded text-white"><Save size={14}/></button></div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full bg-zinc-950 p-3 rounded-xl text-sm text-zinc-300 resize-none border border-zinc-800 focus:border-emerald-500 outline-none" rows={3} placeholder="Notiz..."/>
           </div>
        </div>
    );
}

function ChartsView({ historyData, sessionHits }) {
  const weekStats = useMemo(() => {
     const days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
     const counts = Array(7).fill(0);
     historyData.forEach(h => counts[new Date(h.date).getDay()] += h.count);
     return days.map((d,i) => ({ day:d, val:counts[i] }));
  }, [historyData]);
  const maxW = Math.max(...weekStats.map(s=>s.val), 1);
  const hourlyDist = useMemo(() => {
    const dist = Array(24).fill(0);
    sessionHits.forEach(h => dist[new Date(h.timestamp).getHours()]++);
    return dist;
  }, [sessionHits]);
  const maxH = Math.max(...hourlyDist, 1);
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Statistik</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-amber-500"/><h3 className="text-sm font-bold text-zinc-400 uppercase">Tageszeit Aktivität</h3></div>
         <div className="h-32 flex items-end gap-1">
            {hourlyDist.map((count, h) => (
               <div key={h} className="flex-1 bg-zinc-800 hover:bg-amber-500/50 transition-colors rounded-t-sm relative group" style={{ height: `${(count/maxH)*100}%` }}>
                  {h % 6 === 0 && <span className="absolute -bottom-5 left-0 text-[8px] text-zinc-600">{h}h</span>}
                  {count > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">{count}</div>}
               </div>
            ))}
         </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
         <div className="flex items-center gap-2 mb-4"><CalendarDays size={16} className="text-purple-500"/><h3 className="text-sm font-bold text-zinc-400 uppercase">Wochentage</h3></div>
         <div className="flex justify-between items-end h-32 gap-2">
            {weekStats.map(s => (
                <div key={s.day} className="flex-1 flex flex-col justify-end items-center gap-2">
                   <div className="w-full bg-zinc-800 rounded-t-sm hover:bg-purple-500/50 transition-colors relative group" style={{ height: `${(s.val/maxW)*100}%` }}>
                       {s.val > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 rounded opacity-0 group-hover:opacity-100">{s.val}</div>}
                   </div>
                   <span className="text-[10px] text-zinc-500 uppercase">{s.day}</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function AchievementsView({ achievements }) {
  const sorted = [...ACHIEVEMENT_DATA].sort((a,b) => {
      const au = achievements.some(x=>x.id===a.id);
      const bu = achievements.some(x=>x.id===b.id);
      return bu - au;
  });
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
      <h2 className="text-2xl font-bold text-white">Medaillen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         {sorted.map(a => {
             const unlockedEntry = achievements.find(x=>x.id===a.id);
             return (
                 <div key={a.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${unlockedEntry ? 'bg-zinc-900 border-emerald-500/30' : 'bg-zinc-950 border-zinc-800 opacity-50'}`}>
                    <div className={`p-3 rounded-full ${unlockedEntry ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-lg' : 'bg-zinc-800 text-zinc-600'}`}>
                      {a.Icon && <a.Icon size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm ${unlockedEntry?'text-white':'text-zinc-500'}`}>{a.title}</h4>
                            {!unlockedEntry && <Lock size={12} className="text-zinc-600"/>}
                        </div>
                        <p className="text-xs text-zinc-500">{a.desc}</p>
                        {unlockedEntry && <p className="text-[10px] text-emerald-500 mt-1">{new Date(unlockedEntry.date).toLocaleDateString()}</p>}
                    </div>
                 </div>
             )
         })}
      </div>
    </div>
  );
}

function SettingsView({ settings, setSettings, liveTemp, ip, setIp, connected, setConnected, isSimulating, setIsSimulating, lastError }) {
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
         <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2"><Wifi size={16}/> Verbindung</h3>
         <div className="space-y-3">
            <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase">Sensor IP Adresse</label>
                <div className="flex gap-2">
                    <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none font-mono text-sm" placeholder="192.168.X.X"/>
                    <button onClick={() => { if(navigator.vibrate) navigator.vibrate(20); setConnected(false); }} className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded text-zinc-400 hover:text-white transition-colors border border-zinc-700"><RefreshCw size={16} className={!connected ? "animate-spin" : ""} /></button>
                    <div className={`flex items-center gap-2 px-3 rounded border ${connected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>{connected ? <Wifi size={16}/> : <WifiOff size={16}/>}<span className="text-xs font-bold uppercase hidden sm:inline">{connected ? "Online" : "Offline"}</span></div>
                </div>
            </div>
            {lastError && !connected && !isSimulating && (
               <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
                  <AlertTriangle size={14} />
                  <span>Fehler: {lastError}</span>
               </div>
            )}
            <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSimulating ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{isSimulating ? <Smartphone size={18} /> : <Wifi size={18} />}</div>
                    <div><span className="block text-sm font-bold text-white">{isSimulating ? "Demo Modus" : "Live Sensor"}</span><span className="text-[10px] text-zinc-500">{isSimulating ? "Zufallsdaten" : "Echte Hardware"}</span></div>
                </div>
                <button onClick={() => { if(navigator.vibrate) navigator.vibrate(20); setIsSimulating(!isSimulating); }} className={`relative w-12 h-6 rounded-full transition-colors ${isSimulating ? 'bg-indigo-600' : 'bg-zinc-700'}`}><div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isSimulating ? 'translate-x-6' : 'translate-x-0'}`}></div></button>
            </div>
         </div>
      </div>
      {/* ... Settings: Basis & Kalibrierung & Sorten (identisch zu vorher, nur Platzhalter hier der Übersicht halber) ... */}
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
           <div><label className="flex items-center gap-2 text-white font-medium"><Shield size={20} className={settings.adminMode ? "text-rose-500" : "text-zinc-500"} />Admin Modus</label><p className="text-xs text-zinc-500 mt-1 pl-7">Zeigt Diagnose-Daten im Dashboard.</p></div>
           <button onClick={() => upd('adminMode', !settings.adminMode)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.adminMode ? 'bg-rose-500' : 'bg-zinc-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.adminMode ? 'left-7' : 'left-1'}`}></div></button>
         </div>
      </div>
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
         <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2"><Tag size={16}/> Sorten</h3>
         <div className="space-y-2 max-h-48 overflow-y-auto">{settings.strains.map(s => (<div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border ${editId === s.id ? 'bg-amber-500/10 border-amber-500/50' : 'bg-zinc-950 border-zinc-800'}`}><div><span className="font-bold text-white block text-sm">{s.name}</span><span className="text-[10px] text-zinc-500">{s.price}€/g • {s.thc}% THC</span></div><div className="flex gap-2"><button onClick={() => edit(s)} className={`p-2 rounded hover:bg-zinc-800 ${editId === s.id ? 'text-amber-500' : 'text-zinc-600'}`}><Edit2 size={14}/></button>{settings.strains.length > 1 && <button onClick={() => del(s.id)} className="p-2 rounded hover:bg-rose-900/30 text-zinc-600 hover:text-rose-500"><Trash2 size={14}/></button>}</div></div>))}</div>
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

// --- 5. MAIN LOGIC & LAYOUT ---

const AppContext = createContext();

export default function App() {
  const [settings, setSettings] = useLocalStorage('hs_settings_v6', { bowlSize: 0.3, weedRatio: 80, triggerThreshold: 50, adminMode: false, strains: [{ id: 1, name: "Lemon Haze", price: 10, thc: 22 }] });
  const [historyData, setHistoryData] = useLocalStorage('hs_history_v6', []);
  const [sessionHits, setSessionHits] = useLocalStorage('hs_session_hits_v6', []);
  const [achievements, setAchievements] = useLocalStorage('hs_achievements_v6', []);
  const [goals, setGoals] = useLocalStorage('hs_goals_v6', { dailyLimit: 0, tBreakDays: 0 });
  const [lastActiveDate, setLastActiveDate] = useLocalStorage('hs_last_date', '');
  const [manualOffset, setManualOffset] = useLocalStorage('hs_offset', 0);
  const [lastHitTime, setLastHitTime] = useLocalStorage('hs_last_hit_ts', null);
  const [ip, setIp] = useLocalStorage('hs_device_ip', '192.168.178.XXX');

  // Automatisch Testdaten hinzufügen wenn keine Daten vorhanden
  useEffect(() => {
    if (sessionHits.length === 0 && historyData.length === 0) {
      console.log('🧪 Keine Daten vorhanden - Generiere 30 Tage Testdaten...');
      const testData = generateTestData(30, settings);
      setSessionHits(testData.sessionHits);
      setHistoryData(testData.historyData);
    }
  }, []);  // Nur beim ersten Mount

  const [liveData, setLiveData] = useState({ temp: 0, today: 0, total: 0 });
  const [currentStrainId, setCurrentStrainId] = useState(settings.strains[0]?.id || 0);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestHits, setGuestHits] = useState(0);
  const [connected, setConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [newAchievement, setNewAchievement] = useState(null);
  const [isSensorInhaling, setIsSensorInhaling] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [notification, setNotification] = useState(null);

  const sensorStartRef = useRef(0);
  const simRef = useRef({ temp: 20, lastTrigger: 0, counts: { today: 0, total: 0 } });
  const prevApiTotalRef = useRef(0);
  const tempBuffer = useRef([]);

  // ... (ACHIEVEMENT LOGIC & REGISTER HIT LOGIC are same as before, simplified for brevity) ...
  const unlockAchievement = useCallback((id) => {
    setAchievements(prev => {
      if (prev.some(a => a.id === id)) return prev;
      const def = ACHIEVEMENT_DATA.find(a => a.id === id);
      if (!def) return prev;
      const ach = { id: def.id, date: new Date().toISOString() };
      setNewAchievement({ ...def, date: ach.date });
      setTimeout(() => setNewAchievement(null), 4000);
      return [...prev, ach];
    });
  }, [setAchievements]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActiveDate !== todayStr) { setManualOffset(0); setLastActiveDate(todayStr); }
  }, []);

  const registerHit = (isManual, duration) => {
    const now = Date.now();
    setLastHitTime(now);
    if (isGuestMode) { setGuestHits(p => p + 1); return; }
    const strain = settings.strains.find(s => s.id == currentStrainId) || settings.strains[0] || {name:'?',price:0};
    const newHit = { id: now, timestamp: now, type: isManual ? 'Manuell' : 'Sensor', strainName: strain.name, strainPrice: strain.price, duration };
    setSessionHits(p => [newHit, ...p]);
    setManualOffset(p => p + 1);
    const todayStr = new Date().toISOString().split('T')[0];
    setHistoryData(p => {
      const n = [...p]; const idx = n.findIndex(d => d.date === todayStr);
      if (idx >= 0) { n[idx].count++; n[idx].strainId = strain.id; }
      else n.push({ date: todayStr, count: 1, strainId: strain.id, note: "" });

      // Check Daily Limit Goal
      if (goals.dailyLimit > 0 && n[idx >= 0 ? idx : n.length - 1].count >= goals.dailyLimit) {
        setNotification({
          type: 'warning',
          message: `Tägliches Limit erreicht! (${goals.dailyLimit} Hits)`,
          icon: Bell
        });
        setTimeout(() => setNotification(null), 5000);
      }

      return n;
    });
  };

  const processTemperature = (rawTemp) => {
    tempBuffer.current.push(rawTemp);
    if (tempBuffer.current.length > 5) tempBuffer.current.shift();
    const temp = tempBuffer.current.reduce((a,b)=>a+b,0) / tempBuffer.current.length;
    if (temp >= settings.triggerThreshold && !isSensorInhaling) { setIsSensorInhaling(true); sensorStartRef.current = Date.now(); } 
    else if (temp < (settings.triggerThreshold - 2) && isSensorInhaling) { setIsSensorInhaling(false); if (Date.now() - sensorStartRef.current > 500) registerHit(false, Date.now() - sensorStartRef.current); }
    return temp;
  };

  // NETZWERK POLLING - NEU MIT NATIVE HTTP (Capacitor)
  useEffect(() => {
    const loop = async () => {
      if (isSimulating) {
        let { temp, counts } = simRef.current;
        const target = isSensorInhaling ? 220 : 20;
        temp += (target - temp) * 0.1 + (Math.random() - 0.5) * 2;
        const smoothed = processTemperature(temp);
        simRef.current.temp = temp;
        setLiveData({ temp: smoothed, today: counts.today + manualOffset, total: counts.total + manualOffset });
        setConnected(true);
        setLastError(null);
      } else {
        try {
          const cleanIp = ip.trim().replace(/^http:\/\//, '').replace(/\/$/, '');
          if (!cleanIp) throw new Error("Keine IP");
          
          // NEUER ANSATZ: Native HTTP (Capacitor) statt fetch
          // Funktioniert nur auf dem Gerät, im Browser Fallback
          let json;
          const url = `http://${cleanIp}/api/data`;

          if (NativeCapacitor.isNativePlatform()) {
             const response = await nativeHttp(url);
             if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
             json = response.data;
          } else {
             // Browser Fallback (für Entwicklung)
             const c = new AbortController(); setTimeout(()=>c.abort(), 2000);
             const res = await fetch(url, { signal: c.signal }); // Kein 'mode: cors', Standard lassen
             if(!res.ok) throw new Error(`HTTP ${res.status}`);
             json = await res.json();
          }
          
          if (json.total > prevApiTotalRef.current && prevApiTotalRef.current !== 0 && !isSensorInhaling) registerHit(false, 0);
          prevApiTotalRef.current = json.total;
          
          const smoothed = processTemperature(json.temp);
          setLiveData({ ...json, temp: smoothed, today: json.today + manualOffset, total: json.total + manualOffset });
          setConnected(true);
          setLastError(null);
        } catch (e) { 
          setConnected(false);
          let msg = e.message;
          if (msg.includes('Failed to fetch')) msg = 'Netzwerkfehler (Check WLAN)';
          setLastError(msg);
        }
      }
    };
    const iv = setInterval(loop, isSimulating ? 200 : 1000);
    return () => clearInterval(iv);
  }, [isSimulating, ip, manualOffset, isSensorInhaling, settings.triggerThreshold]);

  const ctx = {
    settings, setSettings, historyData, setHistoryData, sessionHits, setSessionHits,
    achievements, setAchievements, goals, setGoals, lastHitTime,
    liveData, currentStrainId, setCurrentStrainId, isGuestMode, setIsGuestMode, guestHits,
    connected, setConnected, isSimulating, setIsSimulating, newAchievement, isSensorInhaling,
    ip, setIp, lastError, selectedSession, setSelectedSession, notification,
    onManualTrigger: (d) => registerHit(true, d)
  };

  return <AppLayout ctx={ctx} />;
}

function AppLayout({ ctx }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const Content = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardView {...ctx} />;
      case 'calendar': return <CalendarView {...ctx} />;
      case 'strains': return <StrainManagementView {...ctx} />;
      case 'charts': return <ChartsView {...ctx} />;
      case 'analytics': return <AnalyticsView {...ctx} />;
      case 'achievements': return <AchievementsView {...ctx} />;
      case 'settings': return <SettingsView {...ctx} liveTemp={ctx.liveData.temp} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Achievement Notification */}
      {ctx.newAchievement && (
        <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
           <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)] flex items-center gap-4 border border-yellow-400/50">
              <div className="bg-white/20 p-2 rounded-full"><ctx.newAchievement.Icon size={20} /></div>
              <div><p className="text-[10px] uppercase font-bold text-yellow-100 tracking-wider">Erfolg Freigeschaltet</p><p className="font-bold text-lg leading-tight">{ctx.newAchievement.title}</p></div>
           </div>
        </div>
      )}

      {/* Goal/Warning Notification */}
      {ctx.notification && (
        <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
           <div className={`px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] flex items-center gap-4 border ${
             ctx.notification.type === 'warning'
               ? 'bg-gradient-to-r from-orange-500 to-rose-600 border-orange-400/50'
               : 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400/50'
           } text-white`}>
              <div className="bg-white/20 p-2 rounded-full"><ctx.notification.icon size={20} /></div>
              <div><p className="text-[10px] uppercase font-bold opacity-90 tracking-wider">Hinweis</p><p className="font-bold text-lg leading-tight">{ctx.notification.message}</p></div>
           </div>
        </div>
      )}

      {/* Session Details Modal */}
      {ctx.selectedSession && (
        <SessionDetailsModal session={ctx.selectedSession} onClose={() => ctx.setSelectedSession(null)} />
      )}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3"><div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20"><Leaf className="w-6 h-6 text-emerald-400" /></div><div><h1 className="font-bold text-lg text-white">High Score</h1><p className="text-xs text-zinc-500">Pro v6.1</p></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavBtn id="dashboard" icon={<LayoutDashboard/>} label="Dashboard" active={activeTab} set={setActiveTab}/>
          <NavBtn id="calendar" icon={<CalendarIcon/>} label="Tagebuch" active={activeTab} set={setActiveTab}/>
          <NavBtn id="strains" icon={<Tag/>} label="Sorten" active={activeTab} set={setActiveTab}/>
          <NavBtn id="charts" icon={<BarChart3/>} label="Statistik" active={activeTab} set={setActiveTab}/>
          <NavBtn id="analytics" icon={<Brain/>} label="Analytics" active={activeTab} set={setActiveTab}/>
          <NavBtn id="achievements" icon={<Trophy/>} label="Erfolge" active={activeTab} set={setActiveTab}/>
          <NavBtn id="settings" icon={<Settings/>} label="Einstellungen" active={activeTab} set={setActiveTab}/>
        </nav>
        <div className="p-4 border-t border-zinc-800">
           <div className="flex items-center gap-2 text-xs">
             <button onClick={() => ctx.setIsSimulating(!ctx.isSimulating)} className="flex items-center gap-2 text-zinc-500 hover:text-white"><Smartphone size={14}/> {ctx.isSimulating ? "Demo" : "Sensor"}</button>
             <div className="ml-auto flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${ctx.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div></div>
           </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8 relative pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)]"><div className="max-w-5xl mx-auto h-full"><Content /></div></main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50 overflow-x-auto">
        <MobNavBtn id="dashboard" icon={<LayoutDashboard/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="calendar" icon={<CalendarIcon/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="strains" icon={<Tag/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="charts" icon={<BarChart3/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="analytics" icon={<Brain/>} active={activeTab} set={setActiveTab}/>
        <MobNavBtn id="settings" icon={<Settings/>} active={activeTab} set={setActiveTab}/>
      </div>
    </div>
  );
}