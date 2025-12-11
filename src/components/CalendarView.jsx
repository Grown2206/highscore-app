import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function CalendarView({ historyData, setHistoryData }) {
    const [sel, setSel] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState("");
    useEffect(() => { const d = historyData.find(h=>h.date===sel); setNote(d?.note||""); }, [sel, historyData]);
    const save = () => {
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
              <div className="flex justify-between items-center"><span className="text-sm font-bold text-white">{new Date(sel).toLocaleDateString()}</span><button onClick={save} className="bg-emerald-600 p-1.5 rounded text-white"><Save size={14}/></button></div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full bg-zinc-950 p-3 rounded-xl text-sm text-zinc-300 resize-none border border-zinc-800 focus:border-emerald-500 outline-none" rows={3} placeholder="Notiz..."/>
           </div>
        </div>
    );
}