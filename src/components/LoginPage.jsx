// src/components/LoginPage.jsx - Dedicated Authentication Gate for StudyGenie AI
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Hexagon,
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  BookOpen,
  LogIn,
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: 'Stanford University',
    major: 'Computer Science'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Please fill in all required fields (Name, Email, and Password).');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password should be at least 6 characters long.');
        return;
      }

      const res = await register(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.university.trim() || 'University / College',
        formData.major.trim() || 'Academic Studies'
      );
      if (!res.success) {
        setError(res.error || 'Registration failed. Please check your credentials.');
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Please enter your email and password.');
        return;
      }

      const res = await login(formData.email.trim().toLowerCase(), formData.password);
      if (!res.success) {
        setError(res.error || 'Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-x-hidden font-sans"
      style={{ backgroundColor: 'var(--bg-primary, #070913)' }}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md sm:max-w-lg z-10 space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 shadow-xl shadow-purple-950/50 mb-1">
            <div className="w-12 h-12 rounded-[14px] bg-[#0E1322] flex items-center justify-center">
              <Hexagon className="w-7 h-7 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>StudyGenie AI Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isRegisterMode ? 'Create Your Account' : 'Welcome to StudyGenie AI'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              {isRegisterMode
                ? 'Register now to access your personal academic workspace.'
                : 'Sign in to access your personal study workspace.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !isRegisterMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isRegisterMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Main Authentication Card */}
        <div className="glass-card p-5 sm:p-7 rounded-2xl border border-slate-800 bg-[#0E1424]/90 backdrop-blur-xl shadow-2xl space-y-5">

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-md">
              <span className="text-red-400 font-bold shrink-0 mt-0.5">⚠️</span>
              <p className="flex-1 leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Registration-Only Fields */}
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Manish Chauhan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={isRegisterMode}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      University / College
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Stanford / IIT"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Major / Branch
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                color: '#FFFFFF'
              }}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[46px] mt-2"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : isRegisterMode ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              {isRegisterMode ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError('');
                }}
                className="text-purple-400 hover:text-purple-300 font-bold underline ml-1 cursor-pointer"
              >
                {isRegisterMode ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Session • User-Specific Database Storage</span>
        </div>

      </div>
    </div>
  );
}
