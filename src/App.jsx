// src/App.jsx - Main Application Container for StudyGenie
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import PlannerTab from './components/PlannerTab';
import SolverTab from './components/SolverTab';
import NotesQuizTab from './components/NotesQuizTab';
import ProgressDashboardTab from './components/ProgressDashboardTab';
import ProfileTab from './components/ProfileTab';
import QuizModal from './components/QuizModal';
import AuthModal from './components/AuthModal';
import AppearancePanel, { applyPrefs, getInitialPrefs } from './components/AppearancePanel';

function AppContent() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('planner');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [studyHours, setStudyHours] = useState(0);
  const [savedNotes, setSavedNotes] = useState([]);

  // Apply saved appearance preferences immediately on mount
  useEffect(() => {
    applyPrefs(getInitialPrefs());
  }, []);

  return (
    <div
      className="app-container min-h-screen text-slate-100 flex flex-col font-sans"
      style={{ backgroundColor: 'var(--bg-primary, #070913)' }}
    >
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studyHours={studyHours}
        onOpenAppearance={() => setIsAppearanceOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        {activeTab === 'planner' && (
          <PlannerTab
            studyHours={studyHours}
            setStudyHours={setStudyHours}
          />
        )}
        {activeTab === 'solver' && (
          <SolverTab
            onOpenQuiz={() => setIsQuizOpen(true)}
            savedNotes={savedNotes}
            setSavedNotes={setSavedNotes}
          />
        )}
        {activeTab === 'notes' && (
          <NotesQuizTab onOpenQuiz={() => setIsQuizOpen(true)} />
        )}
        {activeTab === 'progress' && <ProgressDashboardTab />}
        {activeTab === 'profile' && (
          <ProfileTab onOpenAppearance={() => setIsAppearanceOpen(true)} />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Appearance Panel (slide-in from right) */}
      <AppearancePanel
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
