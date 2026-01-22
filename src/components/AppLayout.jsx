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
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-lg"
    style={{
      backgroundColor: active === id ? 'var(--accent-success)' : 'transparent',
      color: active === id ? 'white' : 'var(--text-tertiary)',
      boxShadow: active === id ? '0 10px 15px -3px color-mix(in srgb, var(--accent-success) 20%, transparent)' : 'none',
    }}
    onMouseEnter={(e) => {
      if (active !== id) {
        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
      }
    }}
    onMouseLeave={(e) => {
      if (active !== id) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
  >
    {icon} {label}
  </button>
);

const MobNavBtn = ({ id, icon, active, set }) => (
  <button
    onClick={() => { if (navigator.vibrate) navigator.vibrate(10); set(id); }}
    className="p-3 rounded-xl transition-all"
    style={{
      color: active === id ? 'var(--accent-success)' : 'var(--text-disabled)',
      backgroundColor: active === id ? 'color-mix(in srgb, var(--accent-success) 10%, transparent)' : 'transparent',
    }}
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
    <div
      className="flex flex-col md:flex-row h-screen font-sans overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >

      {/* Goal/Warning Notification */}
      {ctx.notification && (
        <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
          <div
            className="px-6 py-4 rounded-2xl flex items-center gap-4 border"
            style={{
              background: ctx.notification.type === 'warning'
                ? 'linear-gradient(to right, var(--accent-warning), var(--accent-error))'
                : 'linear-gradient(to right, var(--accent-info), var(--accent-secondary))',
              borderColor: ctx.notification.type === 'warning'
                ? 'color-mix(in srgb, var(--accent-warning) 50%, transparent)'
                : 'color-mix(in srgb, var(--accent-info) 50%, transparent)',
              color: 'white',
              boxShadow: '0 10px 40px -10px color-mix(in srgb, var(--accent-warning) 30%, transparent)',
            }}
          >
            <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              <ctx.notification.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold opacity-90 tracking-wider">Hinweis</p>
              <p className="font-bold text-lg leading-tight">{ctx.notification.message}</p>
            </div>
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

      <aside
        className="hidden md:flex w-64 border-r flex-col shrink-0 z-20 pt-[env(safe-area-inset-top)]"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div
          className="p-6 border-b flex items-center gap-3"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div
            className="p-2 rounded-xl border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
            }}
          >
            <Leaf className="w-6 h-6" style={{ color: 'var(--accent-success)' }} />
          </div>
          <div>
            <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>High Score</h1>
            <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>Pro v6.1</p>
          </div>
        </div>
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
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
              <Radio
                size={14}
                style={{ color: ctx.connected ? 'var(--accent-success)' : 'var(--accent-error)' }}
              />
              {ctx.connected ? "Verbunden" : "Offline"}
            </span>
            <div
              className={`w-2 h-2 rounded-full ${ctx.connected ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: ctx.connected ? 'var(--accent-success)' : 'var(--accent-error)',
              }}
            />
          </div>
        </div>
      </aside>
      <main
        className="flex-1 overflow-y-auto p-4 md:p-8 relative pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)]"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
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
              esp32Connected={ctx.connected}
              esp32Ip={ctx.ip}
              esp32LiveData={ctx.liveData}
            />
          )}
        </div>
      </main>
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50 overflow-x-auto"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 90%, transparent)',
          borderColor: 'var(--border-primary)',
        }}
      >
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
