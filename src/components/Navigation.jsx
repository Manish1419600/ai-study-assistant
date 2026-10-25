// src/components/Navigation.jsx - Mobile Bottom Navigation
import React from 'react';
import { LayoutGrid, Calendar, HelpCircle, FileText, User } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'progress', label: 'Dashboard',    icon: LayoutGrid },
    { id: 'planner',  label: 'Planner',      icon: Calendar },
    { id: 'solver',   label: 'Doubt Solver', icon: HelpCircle },
    { id: 'notes',    label: 'Documents',    icon: FileText },
    { id: 'profile',  label: 'Profile',      icon: User },
  ];

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 dark:bg-[#0B0E1B]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 pt-1.5 shadow-2xl"
      style={{
        paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))'
      }}
    >
      <div className="grid grid-cols-5 w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-[#00B894] font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#00B894]' : ''}`} />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-full ${isActive ? 'text-[#00B894] font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-[#00B894] rounded-full mt-0.5 shadow-sm shadow-emerald-500/50" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
