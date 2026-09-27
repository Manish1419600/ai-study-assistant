// src/components/Navigation.jsx
import React from 'react';
import { Calendar, Sparkles, BookOpen, TrendingUp, User } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'solver', label: 'Doubt Solver', icon: Sparkles, badge: 'AI' },
    { id: 'notes', label: 'Smart Notes', icon: BookOpen },
    { id: 'progress', label: 'Dashboard', icon: TrendingUp, badge: 'Charts' },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 w-full z-40 bg-[#0B0E1B]/95 backdrop-blur-xl border-t border-slate-800/80 px-1 pt-1.5 shadow-2xl"
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
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-purple-400 bg-purple-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'scale-110 text-purple-400' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-[0.5px] text-[7px] font-extrabold bg-cyan-500 text-[#090C15] rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full ${isActive ? 'text-purple-300 font-bold' : 'text-slate-400 font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-purple-400 rounded-full mt-0.5 shadow-sm shadow-purple-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
