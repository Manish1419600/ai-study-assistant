// src/components/PlannerTab.jsx - 100% User Input Driven Planner (FR2)
import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Flame, Bell, Sparkles, Plus, CheckCircle2, Circle, TrendingUp, Clock, Target, Play, Pause, RotateCcw, Trash2, CalendarCheck } from 'lucide-react';

export default function PlannerTab({ studyHours, setStudyHours }) {
  const { authFetch, user } = useAuth();
  const [scheduleView, setScheduleView] = useState('daily');
  const [activeDate, setActiveDate] = useState(new Date().getDate());
  const [appliedSuggestion, setAppliedSuggestion] = useState(false);
  
  // Pomodoro / Study Session Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerSubject, setTimerSubject] = useState('Mathematics');

  // Dynamic User Tasks state (fetched 100% from user's DB)
  const [tasks, setTasks] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Mathematics');
  const [newTaskPriority, setNewTaskPriority] = useState('High');
  const [newTaskDuration, setNewTaskDuration] = useState('1.5');

  const fetchUserTasks = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/planner/tasks`);
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        setAiSuggestion(data.aiSuggestion);
      }
    } catch (err) {
      console.warn('Task fetch notice:', err);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setStudyHours(prev => parseFloat((prev + 0.42).toFixed(1)));
      alert(`🎉 Study session for ${timerSubject} completed! 25 minutes logged.`);
      setTimerSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerSubject, setStudyHours]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 2);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      num: d.getDate()
    };
  });

  const toggleTask = async (id, currentStatus) => {
    try {
      await authFetch(`${API_BASE_URL}/planner/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !currentStatus })
      });
      fetchUserTasks();
    } catch (err) {
      setTasks(tasks.map(t => (t.id === id || t._id === id) ? { ...t, completed: !t.completed } : t));
    }
  };

  const deleteTask = async (e, id) => {
    e.stopPropagation();
    try {
      await authFetch(`${API_BASE_URL}/planner/tasks/${id}`, { method: 'DELETE' });
      fetchUserTasks();
    } catch (err) {
      setTasks(tasks.filter(t => t.id !== id && t._id !== id));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/planner/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          subject: newTaskSubject,
          priority: newTaskPriority,
          duration: parseFloat(newTaskDuration) || 1.5,
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchUserTasks();
        setNewTaskTitle('');
        setShowTaskModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-7 pb-20">
      {/* Top Greeting & Streak Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            Hello, {user?.name || 'Student'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Cognitive state optimal • Workspace ready for {user?.major || 'Academic Study'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold shadow-inner">
          <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-orange-400 fill-orange-400 animate-bounce" />
          <span>Active Streak</span>
          <span className="text-orange-400">🔥</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="desktop-grid-planner space-y-6 lg:space-y-0">
        
        {/* Left Column: Schedule, Tasks & Pomodoro Timer */}
        <div className="space-y-6">
          {/* Alert Notification Banner */}
          <div className="glass-card p-4 rounded-xl flex items-center justify-between border-slate-800 bg-[#0F1526]/90 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 truncate">
                Next reminder: <span className="text-cyan-400 font-bold">{tasks.find(t => !t.completed)?.title || 'All tasks completed'}</span>
              </p>
            </div>
            <button className="text-slate-400 hover:text-white text-xs sm:text-sm font-bold px-2 flex-shrink-0">•••</button>
          </div>

          {/* Schedule Flow Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-300 tracking-wider uppercase">Schedule Flow</span>
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setScheduleView('daily')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-lg transition-all ${scheduleView === 'daily' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                  Daily View
                </button>
                <button
                  onClick={() => setScheduleView('weekly')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-lg transition-all ${scheduleView === 'weekly' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                  Weekly View
                </button>
              </div>
            </div>

            {/* Date Strip */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full">
              {dates.map((item, idx) => {
                const isSelected = activeDate === item.num;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveDate(item.num)}
                    className={`flex flex-col items-center py-2.5 sm:py-3.5 px-1 sm:px-2 rounded-xl border font-bold transition-all ${
                      isSelected
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs opacity-80">{item.day}</span>
                    <span className="text-xs sm:text-base font-extrabold mt-0.5">{item.num}</span>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Pomodoro Study Timer Widget */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Live Pomodoro Session
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest py-1">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs sm:text-sm text-slate-300">Subject: <span className="text-cyan-300 font-bold">{timerSubject}</span></p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-3 sm:p-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center ${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'gradient-btn-purple text-white shadow-purple-600/30 hover:scale-105'
                }`}
              >
                {isTimerRunning ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />}
              </button>

              <button
                onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                title="Reset Timer"
              >
                <RotateCcw className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Upcoming Tasks & Deadlines Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">≡</span>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Your Study Tasks ({tasks.length})
                </h3>
              </div>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs sm:text-sm font-bold hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>

            {/* Task Creation Modal Form */}
            {showTaskModal && (
              <form onSubmit={handleCreateTask} className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 space-y-3">
                <h4 className="text-sm font-bold text-purple-300">Add New Real-Time Study Task</h4>
                <input
                  type="text"
                  placeholder="Task title (e.g. Prepare Quantum Mechanics Assignment)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>

                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="High">Priority: High</option>
                    <option value="Medium">Priority: Medium</option>
                    <option value="Low">Priority: Low</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs sm:text-sm text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-purple-600 text-xs sm:text-sm text-white font-bold"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Task List or Clean Empty State */}
            {tasks.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl border-slate-800 text-center space-y-3 bg-slate-900/40">
                <CalendarCheck className="w-10 h-10 text-purple-400 mx-auto opacity-70" />
                <h4 className="text-sm sm:text-base font-bold text-white">No tasks created yet</h4>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  Your task canvas is clean! Click **"New Task"** above to create your first real-time study task.
                </p>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs sm:text-sm font-bold shadow hover:bg-purple-500"
                >
                  + Add First Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id || task._id}
                    onClick={() => toggleTask(task.id || task._id, task.completed)}
                    className={`glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer border-slate-800 transition-all ${
                      task.completed ? 'opacity-60 bg-slate-900/40' : 'hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button className="mt-0.5 text-slate-400 hover:text-purple-400">
                        {task.completed ? (
                          <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-5.5 h-5.5 text-slate-500" />
                        )}
                      </button>
                      <div className="space-y-1.5">
                        <h4 className={`text-sm sm:text-base font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2.5 text-xs text-slate-300">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {task.due || 'Scheduled'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            task.priority === 'High' ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-200'
                          }`}>
                            Priority: {task.priority}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
                            {task.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm text-slate-300 font-medium">
                        {task.duration || 1.5}h
                      </span>
                      <button
                        onClick={(e) => deleteTask(e, task.id || task._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Suggestion & Retention Analytics */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-xl border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">AI Planner Assistant</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                  {aiSuggestion?.text || 'Add tasks to receive personalized AI study recommendations.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Your Study Metrics
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-3.5 rounded-xl text-left border-slate-800">
                <span className="text-xs font-medium text-slate-400 block">Total Tasks</span>
                <div className="text-lg sm:text-xl font-bold text-white mt-1">
                  {tasks.length}
                </div>
              </div>

              <div className="glass-card p-3.5 rounded-xl text-left border-slate-800">
                <span className="text-xs font-medium text-slate-400 block">Completed</span>
                <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
                  {completedCount}
                </div>
              </div>

              <div className="glass-card p-3.5 rounded-xl text-left border-slate-800">
                <span className="text-xs font-medium text-slate-400 block">Task Rate</span>
                <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-1">
                  {completionRate}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
