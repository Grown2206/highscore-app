import React, { useState } from 'react';
import {
  Leaf, LayoutDashboard, Calendar as CalendarIcon, BarChart3, Settings,
  Radio, Tag, Brain, Trophy
} from 'lucide-react';
import AnalyticsView from './AnalyticsView';
import SessionDetailsModal from './SessionDetailsModal';
import StrainManagementView from './StrainManagementView';
import CalendarView from './CalendarView';
import ChartsView from './ChartsView';
import SettingsView from './SettingsView';
import DashboardView from './DashboardView';
import AchievementsView from './AchievementsView';
import ESP32DebugView from './ESP32DebugView';
import DataRecovery from './DataRecovery';

const NavBtn = ({ id, icon, label, active, set }) => (
  <button
    onClick={() => { if (navigator.vibrate) navigator.vibrate(10); set(id); }}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active === id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-400 hover:bg-zinc-800'}`}
  >
    {icon} {label}
  </button>
);

const MobNavBtn = ({ id, icon, active, set }) => (
  <button
    onClick={() => { if (navigator.vibrate) navigator.vibrate(10); set(id); }}
    className={`p-3 rounded-xl transition-all ${active === id ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500'}`}
  >
    {icon}
  </button>
);

export default function AppLayout({ ctx }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fallback: Prevent 'badges' tab (removed) from being set
  const safeSetActiveTab = (tab) => {
    if (tab === 'badges') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">

      {/* Goal/Warning Notification */}
      {ctx.notification && (
        <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
          <div className={`px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] flex items-center gap-4 border ${ctx.notification.type === 'warning'
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

      {/* Data Recovery Modal */}
      {ctx.showRecovery && (
        <DataRecovery
          onRestore={ctx.handleDataRestore}
          onDismiss={() => ctx.setShowRecovery(false)}
        />
      )}

      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3"><div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20"><Leaf className="w-6 h-6 text-emerald-400" /></div><div><h1 className="font-bold text-lg text-white">High Score</h1><p className="text-xs text-zinc-500">Pro v6.1</p></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavBtn id="dashboard" icon={<LayoutDashboard />} label="Dashboard" active={activeTab} set={safeSetActiveTab} />
          <NavBtn id="calendar" icon={<CalendarIcon />} label="Tagebuch" active={activeTab} set={safeSetActiveTab} />
          <NavBtn id="strains" icon={<Tag />} label="Sorten" active={activeTab} set={safeSetActiveTab} />
          <NavBtn id="charts" icon={<BarChart3 />} label="Statistik" active={activeTab} set={safeSetActiveTab} />
          <NavBtn id="analytics" icon={<Brain />} label="Analytics" active={activeTab} set={safeSetActiveTab} />
          <NavBtn id="achievements" icon={<Trophy />} label="Erfolge" active={activeTab} set={safeSetActiveTab} />
          <NavBtn id="esp32" icon={<Radio />} label="ESP32 Debug" active={activeTab} set={safeSetActiveTab} />
          <NavBtn id="settings" icon={<Settings />} label="Einstellungen" active={activeTab} set={safeSetActiveTab} />
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-600 flex items-center gap-1.5">
              <Radio size={14} className={ctx.connected ? "text-emerald-500" : "text-rose-500"} />
              {ctx.connected ? "Verbunden" : "Offline"}
            </span>
            <div className={`w-2 h-2 rounded-full ${ctx.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8 relative pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <div className="max-w-5xl mx-auto h-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              liveData={ctx.liveData}
              lastHitTime={ctx.lastHitTime}
              settings={ctx.settings}
              isGuestMode={ctx.isGuestMode}
              setIsGuestMode={ctx.setIsGuestMode}
              guestHits={ctx.guestHits}
              resetGuestHits={ctx.resetGuestHits}
              deleteHit={ctx.deleteHit}
              deleteHits={ctx.deleteHits}
              onManualTrigger={ctx.onManualTrigger}
              onHoldStart={ctx.onHoldStart}
              onHoldEnd={ctx.onHoldEnd}
              currentStrainId={ctx.currentStrainId}
              setCurrentStrainId={ctx.setCurrentStrainId}
              isSensorInhaling={ctx.isSensorInhaling}
              sessionHits={ctx.sessionHits}
              sessionHitsCount={ctx.sessionHitsCount}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarView
              historyData={ctx.historyData}
              setHistoryData={ctx.setHistoryData}
              settings={ctx.settings}
              deleteHit={ctx.deleteHit}
              deleteHits={ctx.deleteHits}
              sessionHits={ctx.sessionHits}
            />
          )}
          {activeTab === 'strains' && (
            <StrainManagementView
              settings={ctx.settings}
              setSettings={ctx.setSettings}
            />
          )}
          {activeTab === 'charts' && (
            <ChartsView
              historyData={ctx.historyData}
              settings={ctx.settings}
              sessionHits={ctx.sessionHits}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsView
              historyData={ctx.historyData}
              settings={ctx.settings}
            />
          )}
          {activeTab === 'achievements' && (
            <AchievementsView
              sessionHits={ctx.sessionHits}
              historyData={ctx.historyData}
              settings={ctx.settings}
            />
          )}
          {activeTab === 'esp32' && (
            <ESP32DebugView
              ip={ctx.ip}
              setIp={ctx.setIp}
              connected={ctx.connected}
              isSimulating={ctx.isSimulating}
              setIsSimulating={ctx.setIsSimulating}
              lastError={ctx.lastError}
              connectionLog={ctx.connectionLog}
              flameHistory={ctx.flameHistory}
              liveData={ctx.liveData}
              errorCount={ctx.errorCount}
              settings={ctx.settings}
              setSettings={ctx.setSettings}
              forceSyncPendingHits={ctx.forceSyncPendingHits}
              isSyncing={ctx.isSyncing}
              lastSyncTime={ctx.lastSyncTime}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              settings={ctx.settings}
              setSettings={ctx.setSettings}
              historyData={ctx.historyData}
              setHistoryData={ctx.setHistoryData}
              sessionHits={ctx.sessionHits}
              setSessionHits={ctx.setSessionHits}
              goals={ctx.goals}
              setGoals={ctx.setGoals}
              showRecovery={ctx.showRecovery}
              setShowRecovery={ctx.setShowRecovery}
              isSimulating={ctx.isSimulating}
              setIsSimulating={ctx.setIsSimulating}
            />
          )}
        </div>
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50 overflow-x-auto">
        <MobNavBtn id="dashboard" icon={<LayoutDashboard />} active={activeTab} set={safeSetActiveTab} />
        <MobNavBtn id="calendar" icon={<CalendarIcon />} active={activeTab} set={safeSetActiveTab} />
        <MobNavBtn id="strains" icon={<Tag />} active={activeTab} set={safeSetActiveTab} />
        <MobNavBtn id="charts" icon={<BarChart3 />} active={activeTab} set={safeSetActiveTab} />
        <MobNavBtn id="analytics" icon={<Brain />} active={activeTab} set={safeSetActiveTab} />
        <MobNavBtn id="achievements" icon={<Trophy />} active={activeTab} set={safeSetActiveTab} />
        <MobNavBtn id="esp32" icon={<Radio />} active={activeTab} set={safeSetActiveTab} />
        <MobNavBtn id="settings" icon={<Settings />} active={activeTab} set={safeSetActiveTab} />
      </div>
    </div>
  );
}
