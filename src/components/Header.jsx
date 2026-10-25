// src/components/Header.jsx - Minimalist Top Bar matching modern dashboard layout
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sun, 
  Moon, 
  Palette, 
  RefreshCw, 
  Menu, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleLightDarkMode, getInitialPrefs } from './AppearancePanel';

export default function Header({ activeTab, setActiveTab, studyHours, onOpenAppearance, onToggleSidebar }) {
  const { user, isAuthenticated, setIsAuthModalOpen, isSocketConnected, isOnline } = useAuth();
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

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/90 dark:bg-[#0B0E1B]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
      
      {/* Left: Mobile hamburger menu & Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live sync status pill */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              isSocketConnected
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                : !isOnline
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400'
                : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSocketConnected ? 'bg-emerald-500 animate-pulse' : !isOnline ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
            />
            <span>{isSocketConnected ? 'Cloud Synced' : (!isOnline ? 'Offline Mode' : 'Online Ready')}</span>
          </span>
        </div>
      </div>

      {/* Right: Quick Tools + Notifications + Profile matching screenshot */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Quick Tools */}
        <div className="flex items-center gap-1">
          {/* Light / Dark Mode */}
          <button
            type="button"
            onClick={() => {
              const updated = toggleLightDarkMode();
              setIsLightMode(updated.mode === 'light');
            }}
            title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isLightMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Theme customizer */}
          <button
            type="button"
            onClick={onOpenAppearance}
            title="Appearance Theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Palette className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </button>

          {/* Refresh / Sync */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Sync Database"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-500 dark:text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Notification Bell matching screenshot */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => alert('Notification Center: Study tasks synced with real-time database!')}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0E1B]" />
          </button>
        </div>

        {/* User Profile matching the screenshot layout */}
        {isAuthenticated ? (
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-3 pl-2 sm:pl-3 pr-1 py-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
          >
            {/* Teal squircle / circle avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold flex items-center justify-center shadow-sm flex-shrink-0">
              <UserIcon className="w-5 h-5 text-white" />
            </div>

            {/* Name & Email */}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name || 'Alex'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 leading-tight">
                {user?.email || 'student@studygenie.ai'}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#00B894] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Sign In
          </button>
        )}

      </div>
    </header>
  );
}
