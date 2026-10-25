// src/App.jsx - Main Application Container with Sidebar Layout
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Navigation from './components/Navigation';
import PlannerTab from './components/PlannerTab';
import SolverTab from './components/SolverTab';
import NotesQuizTab from './components/NotesQuizTab';
import ProgressDashboardTab from './components/ProgressDashboardTab';
import ProfileTab from './components/ProfileTab';
import QuizModal from './components/QuizModal';
import AuthModal from './components/AuthModal';
import AppearancePanel, { applyPrefs, getInitialPrefs } from './components/AppearancePanel';
import PullToRefresh from './components/PullToRefresh';
import LoginPage from './components/LoginPage';

function AppContent() {
  const { user, isAuthenticated, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('progress'); // Default to Dashboard as shown in screenshot
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [studyHours, setStudyHours] = useState(0);
  const [savedNotes, setSavedNotes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Apply saved appearance preferences immediately on mount
  useEffect(() => {
    applyPrefs(getInitialPrefs());
  }, []);

  const handleGlobalRefresh = async () => {
    setRefreshKey(k => k + 1);
  };

  // Enforce Authentication Gate:
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <PullToRefresh onRefresh={handleGlobalRefresh}>
      <div
        className="app-container min-h-screen max-w-[100vw] overflow-x-hidden text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans"
        style={{ backgroundColor: 'var(--bg-primary, #F8FAFC)' }}
      >
        {/* Desktop Left Sidebar & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuiz={() => setIsQuizOpen(true)}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Right Main Column: Top Bar + Content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            studyHours={studyHours}
            onOpenAppearance={() => setIsAppearanceOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          />

          {/* Main Content Workspace */}
          <main className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-20 lg:pb-12 bg-[#F8FAFC] dark:bg-[#070913]">
            {activeTab === 'planner' && (
              <PlannerTab
                key={`planner-${refreshKey}`}
                studyHours={studyHours}
                setStudyHours={setStudyHours}
              />
            )}
            {activeTab === 'solver' && (
              <SolverTab
                key={`solver-${refreshKey}`}
                onOpenQuiz={() => setIsQuizOpen(true)}
                savedNotes={savedNotes}
                setSavedNotes={setSavedNotes}
              />
            )}
            {activeTab === 'notes' && (
              <NotesQuizTab
                key={`notes-${refreshKey}`}
                onOpenQuiz={() => setIsQuizOpen(true)}
              />
            )}
            {activeTab === 'progress' && (
              <ProgressDashboardTab key={`progress-${refreshKey}`} />
            )}
            {activeTab === 'profile' && (
              <ProfileTab
                key={`profile-${refreshKey}`}
                onOpenAppearance={() => setIsAppearanceOpen(true)}
              />
            )}
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Modals */}
        <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        {/* Appearance Panel */}
        <AppearancePanel
          isOpen={isAppearanceOpen}
          onClose={() => setIsAppearanceOpen(false)}
        />
      </div>
    </PullToRefresh>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
