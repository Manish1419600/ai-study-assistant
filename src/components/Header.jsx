import React, { useState, useEffect } from 'react';
import { Hexagon, Bell, Calendar, Sparkles, BookOpen, TrendingUp, User, LogIn, LogOut, Clock, Palette, Sun, Moon, RefreshCw, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleLightDarkMode, getInitialPrefs } from './AppearancePanel';

export default function Header({ activeTab, setActiveTab, studyHours, onOpenAppearance }) {
  const { user, isAuthenticated, logout, setIsAuthModalOpen, isSocketConnected, isOnline } = useAuth();
  const [isLightMode, setIsLightMode] = useState(() => getInitialPrefs().mode === 'light');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const onStart = () => setIsRefreshing(true);
    const onDone = () => setTimeout(() => setIsRefreshing(false), 600);
    window.addEventListener('studygenie_refresh', onStart);
    window.addEventListener('studygenie_refresh_done', onDone);
    return () => {
      window.removeEventListener('studygenie_refresh', onStart);
      window.removeEventListener('studygenie_refresh_done', onDone);
    };
  }, []);

  const handleRefresh = (e) => {
    if (e?.shiftKey) {
      window.location.reload();
      return;
    }
    setIsRefreshing(true);
    window.dispatchEvent(new CustomEvent('studygenie_trigger_refresh'));
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  useEffect(() => {
    const handleAppearanceChange = (e) => {
      if (e.detail?.mode) {
        setIsLightMode(e.detail.mode === 'light');
      }
    };
    window.addEventListener('sg_appearance_changed', handleAppearanceChange);
    return () => window.removeEventListener('sg_appearance_changed', handleAppearanceChange);
  }, []);

  const navItems = [
    { id: 'planner',  label: 'Planner',      icon: Calendar },
    { id: 'solver',   label: 'Doubt Solver', icon: Sparkles,   badge: 'AI' },
    { id: 'notes',    label: 'Smart Notes',  icon: BookOpen },
    { id: 'progress', label: 'Dashboard',    icon: TrendingUp, badge: 'Charts' },
    { id: 'profile',  label: 'Profile',      icon: User },
  ];

  return (
    <header className="app-header sticky top-0 z-30 backdrop-blur-xl px-3 sm:px-6 py-2 border-b flex items-center justify-between w-full shadow-sm transition-all duration-200">

      {/* ── Brand & Cloud Status ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-md shadow-purple-600/20 flex-shrink-0 hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#0E1322] rounded-[10px] flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
              StudyGenie<span className="text-cyan-400 ml-1">AI</span>
            </h1>

            {/* Subtle Status Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                isSocketConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : !isOnline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSocketConnected ? 'bg-emerald-500 animate-pulse' : !isOnline ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
              />
              <span>{isSocketConnected ? 'Cloud Synced' : (!isOnline ? 'Offline' : 'Ready')}</span>
            </span>
          </div>

          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-0.5 hidden sm:inline">
            Intelligent Academic Workspace
          </span>
        </div>
      </div>

      {/* ── Modern Floating Segmented Navigation Bar (Desktop) ── */}
      <nav
        aria-label="Main Navigation"
        className="hidden lg:flex items-center gap-1 p-1 rounded-full border shadow-inner transition-colors"
        style={{
          backgroundColor: isLightMode ? '#F1F5F9' : 'rgba(15, 23, 42, 0.75)',
          borderColor: isLightMode ? '#E2E8F0' : 'rgba(51, 65, 85, 0.5)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-2 cursor-pointer text-xs xl:text-sm whitespace-nowrap select-none ${
                isActive
                  ? 'text-white shadow-md'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                      boxShadow: '0 2px 10px rgba(124, 58, 237, 0.35)'
                    }
                  : undefined
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-500/15 text-purple-600 dark:text-cyan-400 border border-purple-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Right Actions & Utilities (Refined & Clean) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

        {/* Study Time Chip - Desktop only */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Clock className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>{studyHours || 0}h Studied</span>
        </div>

        {/* Unified Icon Toolbar */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-full border transition-colors"
          style={{
            backgroundColor: isLightMode ? '#F1F5F9' : 'rgba(15, 23, 42, 0.75)',
            borderColor: isLightMode ? '#E2E8F0' : 'rgba(51, 65, 85, 0.5)'
          }}
        >
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const updated = toggleLightDarkMode();
              setIsLightMode(updated.mode === 'light');
            }}
            title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isLightMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Theme Drawer */}
          <button
            type="button"
            onClick={onOpenAppearance}
            title="Appearance & Theme Colors"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Palette className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </button>

          {/* Refresh / Sync */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh App & Sync with Database (Hold Shift to hard reload)"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-500 dark:text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => alert('Notification Center: Study tasks synced with real-time database!')}
            className="relative w-8 h-8 rounded-full hidden sm:flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-white dark:ring-[#0E1322]" />
          </button>
        </div>

        {/* User Profile Pill & Logout */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              title="View Profile & Settings"
              className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full border transition-all cursor-pointer shadow-sm hover:border-purple-500/50"
              style={{
                backgroundColor: isLightMode ? '#FFFFFF' : 'rgba(15, 23, 42, 0.85)',
                borderColor: isLightMode ? '#CBD5E1' : 'rgba(51, 65, 85, 0.6)'
              }}
            >
              <span className="font-bold text-xs max-w-[80px] sm:max-w-[120px] truncate text-slate-800 dark:text-slate-200">
                {user?.name ? user.name.split(' ')[0] : 'Student'}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST'}
              </div>
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="w-8 h-8 rounded-full border flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              style={{
                backgroundColor: isLightMode ? '#FFFFFF' : 'rgba(15, 23, 42, 0.85)',
                borderColor: isLightMode ? '#CBD5E1' : 'rgba(51, 65, 85, 0.6)'
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer text-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
