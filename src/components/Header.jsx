// src/components/Header.jsx - With Appearance and Light/Dark Mode Switcher
import React, { useState, useEffect } from 'react';
import { Hexagon, Bell, Calendar, Sparkles, BookOpen, TrendingUp, User, LogIn, LogOut, Clock, Palette, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleLightDarkMode, getInitialPrefs } from './AppearancePanel';

export default function Header({ activeTab, setActiveTab, studyHours, onOpenAppearance }) {
  const { user, isAuthenticated, logout, setIsAuthModalOpen, isSocketConnected } = useAuth();
  const [isLightMode, setIsLightMode] = useState(() => getInitialPrefs().mode === 'light');

  useEffect(() => {
    const handleAppearanceChange = (e) => {
      if (e.detail?.mode) {
        setIsLightMode(e.detail.mode === 'light');
      }
    };
    window.addEventListener('sg_appearance_changed', handleAppearanceChange);
    return () => window.removeEventListener('sg_appearance_changed', handleAppearanceChange);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'planner':   return 'AI Study Planner';
      case 'solver':    return 'AI Doubt Solver & Auto-FAQ';
      case 'notes':     return 'Smart Notes Generator';
      case 'progress':  return 'Progress Dashboard';
      case 'profile':
      default:          return 'Profile & Settings';
    }
  };

  const navItems = [
    { id: 'planner',  label: 'Planner',      icon: Calendar },
    { id: 'solver',   label: 'Doubt Solver', icon: Sparkles,   badge: 'AI' },
    { id: 'notes',    label: 'Smart Notes',  icon: BookOpen },
    { id: 'progress', label: 'Dashboard',    icon: TrendingUp, badge: 'Charts' },
    { id: 'profile',  label: 'Profile',      icon: User },
  ];

  return (
    <header className="app-header sticky top-0 z-30 backdrop-blur-md px-3 sm:px-6 lg:px-10 py-2.5 sm:py-4 border-b flex items-center justify-between w-full shadow-md transition-colors">

      {/* ── Brand ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-md flex-shrink-0">
          <div className="w-full h-full bg-[#0E1322] rounded-[7px] sm:rounded-[9px] flex items-center justify-center">
            <Hexagon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 fill-cyan-400/20" />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-xl font-bold tracking-tight leading-tight flex items-center gap-1.5 sm:gap-2 truncate">
            StudyGenie AI
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
              College Project
            </span>
            <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isSocketConnected 
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isSocketConnected ? 'Backend Live' : 'Connecting...'}</span>
            </span>
          </h1>
          <p className="text-[11px] sm:text-sm font-semibold text-cyan-400 tracking-wide truncate">
            {getTabTitle()}
          </p>
        </div>
      </div>

      {/* ── PC Nav Bar (Desktop Only) ── */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                isActive
                  ? 'header-nav-tab active bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              style={{ fontSize: '0.95rem' }}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold"
                  style={{ fontSize: '0.7rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Right Controls (Ultra-Compact on Mobile) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">

        {/* Study hours - Desktop only */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 font-bold text-slate-200 text-xs">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{studyHours || 0}h Studied</span>
        </div>

        {/* Quick Light / Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={() => {
            const updated = toggleLightDarkMode();
            setIsLightMode(updated.mode === 'light');
          }}
          title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border transition-all shadow-sm cursor-pointer"
          style={{
            backgroundColor: isLightMode ? '#F1F5F9' : 'rgba(30, 41, 59, 0.9)',
            borderColor: isLightMode ? '#CBD5E1' : 'rgba(51, 65, 85, 0.8)',
            color: isLightMode ? '#0F172A' : '#F8FAFC'
          }}
        >
          {isLightMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Appearance toggle drawer button */}
        <button
          type="button"
          onClick={onOpenAppearance}
          title="Appearance & Theme Customizer"
          className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border transition-all shadow-sm group cursor-pointer"
          style={{
            backgroundColor: isLightMode ? '#F1F5F9' : 'rgba(30, 41, 59, 0.9)',
            borderColor: isLightMode ? '#CBD5E1' : 'rgba(51, 65, 85, 0.8)',
            color: isLightMode ? '#0F172A' : '#F8FAFC'
          }}
        >
          <Palette className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-bold text-xs">Theme</span>
        </button>

        {/* Notifications - Hidden on small mobile */}
        <button
          aria-label="Notifications"
          onClick={() => alert('Notification Center: Study tasks synced with real-time database!')}
          className="relative hidden sm:flex p-2 sm:p-2.5 rounded-xl border text-slate-200 transition-colors items-center justify-center"
          style={{
            backgroundColor: isLightMode ? '#F1F5F9' : 'rgba(30, 41, 59, 0.9)',
            borderColor: isLightMode ? '#CBD5E1' : 'rgba(51, 65, 85, 0.8)',
            color: isLightMode ? '#0F172A' : '#F8FAFC'
          }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0A0D18]" />
        </button>

        {/* Auth / Login */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 p-1 sm:pl-2.5 rounded-full border hover:border-purple-500/40 transition-colors cursor-pointer"
              style={{
                backgroundColor: isLightMode ? '#F1F5F9' : 'rgba(15, 23, 42, 0.8)',
                borderColor: isLightMode ? '#CBD5E1' : 'rgba(51, 65, 85, 0.8)'
              }}
            >
              <span className="font-bold hidden sm:inline-block text-xs" style={{ color: isLightMode ? '#0F172A' : '#E2E8F0' }}>
                {user?.name ? user.name.split(' ')[0] : 'Student'}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-purple-500/40 overflow-hidden bg-purple-900 flex items-center justify-center">
                <span className="font-bold text-purple-200 text-xs">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'ST'}
                </span>
              </div>
            </button>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 sm:p-2 rounded-xl border text-slate-400 hover:text-rose-400 transition cursor-pointer"
              style={{
                backgroundColor: isLightMode ? '#F1F5F9' : 'rgba(30, 41, 59, 0.9)',
                borderColor: isLightMode ? '#CBD5E1' : 'rgba(51, 65, 85, 0.8)'
              }}
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer text-xs"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
