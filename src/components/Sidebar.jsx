// src/components/Sidebar.jsx - Modern Left Sidebar Navigation
import React from 'react';
import { 
  LayoutGrid, 
  FileText, 
  BookOpen, 
  User, 
  LogOut, 
  Calendar, 
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, onOpenQuiz, isSidebarOpen, setIsSidebarOpen }) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'progress', label: 'Dashboard',    icon: LayoutGrid },
    { id: 'planner',  label: 'Planner',      icon: Calendar },
    { id: 'solver',   label: 'Doubt Solver', icon: HelpCircle },
    { id: 'notes',    label: 'Documents',    icon: FileText },
    { id: 'quiz',     label: 'Flashcards',   icon: BookOpen },
    { id: 'profile',  label: 'Profile',      icon: User },
  ];

  const handleSelectTab = (tabId) => {
    if (tabId === 'quiz') {
      if (onOpenQuiz) onOpenQuiz();
      setActiveTab('notes');
    } else {
      setActiveTab(tabId);
    }
    if (setIsSidebarOpen) setIsSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-white dark:bg-[#0B0E1B] border-r border-slate-200/80 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-2 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight">
                AI Learning Assistant
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                StudyGenie Workspace
              </span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {setIsSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#00B894] text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
