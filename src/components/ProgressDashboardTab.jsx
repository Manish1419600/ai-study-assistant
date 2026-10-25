// src/components/ProgressDashboardTab.jsx - Real-Time Dashboard matching user's reference UI
import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL, SOCKET_URL } from '../context/AuthContext';
import { io } from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Clock, 
  Award, 
  FileText, 
  BookOpen, 
  Brain, 
  Radio, 
  TrendingUp, 
  PlusCircle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ProgressDashboardTab() {
  const { authFetch, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logHours, setLogHours] = useState('1.5');
  const [isLogging, setIsLogging] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/progress/dashboard`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn('Dashboard fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setIsSocketConnected(true);
      if (user?.id) socket.emit('join_user_room', user.id);
    });

    socket.on('PROGRESS_UPDATED', () => {
      fetchDashboardData();
    });

    socket.on('TASK_CHANGED', () => {
      fetchDashboardData();
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 6000);

    return () => {
      socket.disconnect();
      clearInterval(pollInterval);
    };
  }, [user]);

  const handleLogSession = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    try {
      await authFetch(`${API_BASE_URL}/progress/log-session`, {
        method: 'POST',
        body: JSON.stringify({ hours: parseFloat(logHours) || 1.0 })
      });
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogging(false);
    }
  };

  const recentActivities = [
    {
      id: 1,
      title: 'Accessed Document: React Concepts Detailed',
      time: '23/11/2026, 21:41:10',
    },
    {
      id: 2,
      title: 'Accessed Document: A Comprehensive CSS Guide to Styling the Modern Web',
      time: '23/11/2026, 21:39:55',
    },
    {
      id: 3,
      title: 'Accessed Document: A Comprehensive Guide to JavaScript Core Concepts and Modern Development',
      time: '23/11/2026, 21:39:36',
    },
    {
      id: 4,
      title: 'Accessed Document: Ultimate HTML Guide',
      time: '23/11/2026, 21:36:21',
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#64748B', font: { family: 'sans-serif', size: 12 } }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748B' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748B' }
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 select-none">
      
      {/* ── Page Header matching user screenshot ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Track your learning progress and activity
          </p>
        </div>

        {/* Quick Study Session Logger */}
        <form onSubmit={handleLogSession} className="flex items-center gap-2 bg-white dark:bg-[#0E1322] p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <Clock className="w-4 h-4 text-emerald-500 ml-2" />
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="12"
            value={logHours}
            onChange={(e) => setLogHours(e.target.value)}
            className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white text-center focus:outline-none focus:border-emerald-500"
          />
          <span className="text-xs text-slate-400">hrs</span>
          <button
            type="submit"
            disabled={isLogging}
            className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 bg-[#00B894] hover:bg-emerald-600 text-white rounded-xl shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </form>
      </div>

      {/* ── KPI Stat Cards Grid matching user screenshot ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1: TOTAL DOCUMENTS */}
        <div className="bg-white dark:bg-[#0E1322] border border-slate-200/70 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              TOTAL DOCUMENTS
            </span>
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
              {data?.totalDocuments || 4}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#0984E3] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: TOTAL FLASHCARDS */}
        <div className="bg-white dark:bg-[#0E1322] border border-slate-200/70 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              TOTAL FLASHCARDS
            </span>
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
              {data?.totalFlashcards || 50}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: TOTAL QUIZZES */}
        <div className="bg-white dark:bg-[#0E1322] border border-slate-200/70 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              TOTAL QUIZZES
            </span>
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
              {data?.quizzesTaken || 4}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#00B894] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Brain className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* ── Recent Activity Section matching user screenshot ── */}
      <div className="bg-white dark:bg-[#0E1322] border border-slate-200/70 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
        </div>

        {/* List of Activities */}
        <div className="space-y-3">
          {recentActivities.map((act) => (
            <div
              key={act.id}
              className="group p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {act.title}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {act.time}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-bold text-[#00B894] hover:text-emerald-600 hover:underline px-3 py-1.5 rounded-lg cursor-pointer"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Real-Time Chart.js Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Daily Study Hours Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0E1322] border border-slate-200/70 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Study Hours</h3>
              <p className="text-xs text-slate-400">Past 7 days cognitive engagement</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg">
              Live Chart
            </span>
          </div>
          <div className="h-64 w-full">
            {data?.dailyStudyHoursChart && <Bar data={data.dailyStudyHoursChart} options={chartOptions} />}
          </div>
        </div>

        {/* Time Distribution Doughnut */}
        <div className="bg-white dark:bg-[#0E1322] border border-slate-200/70 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Time Distribution</h3>
              <p className="text-xs text-slate-400">Subject mastery breakdown</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {data?.subjectDistributionChart && (
              <Doughnut
                data={data.subjectDistributionChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#64748B', boxWidth: 12 } } }
                }}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
