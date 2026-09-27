// src/components/AppearancePanel.jsx
// Complete slide-in appearance drawer with Light Mode / Dark Mode, Palette, and Font Scaling

import React, { useState, useEffect } from 'react';
import { X, Type, Palette, Sun, Moon, RefreshCw, Check } from 'lucide-react';

export const FONT_OPTIONS = [
  { label: 'Small',  value: 14, desc: 'Compact' },
  { label: 'Medium', value: 16, desc: 'Standard' },
  { label: 'Large',  value: 18, desc: 'Comfortable' },
  { label: 'XLarge', value: 20, desc: 'Accessible' },
];

export const ACCENT_OPTIONS = [
  { label: 'Purple', from: '#9333EA', to: '#6366F1', ring: 'rgba(147, 51, 234, 0.4)' },
  { label: 'Cyan',   from: '#06B6D4', to: '#3B82F6', ring: 'rgba(6, 182, 212, 0.4)' },
  { label: 'Rose',   from: '#F43F5E', to: '#EC4899', ring: 'rgba(244, 63, 94, 0.4)' },
  { label: 'Emerald',from: '#10B981', to: '#059669', ring: 'rgba(16, 185, 129, 0.4)' },
  { label: 'Amber',  from: '#F59E0B', to: '#EA580C', ring: 'rgba(245, 158, 11, 0.4)' },
];

// LIGHT THEMES (Removes the black screen completely!)
export const LIGHT_BG_OPTIONS = [
  { label: 'Academic White', bg: '#F8FAFC', card: '#FFFFFF', header: 'rgba(255, 255, 255, 0.95)', border: '#E2E8F0', text: '#0F172A', mode: 'light' },
  { label: 'Soft Slate Light', bg: '#F1F5F9', card: '#FFFFFF', header: 'rgba(248, 250, 252, 0.95)', border: '#CBD5E1', text: '#0F172A', mode: 'light' },
  { label: 'Campus Cream', bg: '#FDFBF7', card: '#FFFFFF', header: 'rgba(253, 251, 247, 0.95)', border: '#EAE4DC', text: '#1C1917', mode: 'light' },
  { label: 'Sky Breeze', bg: '#F0F9FF', card: '#FFFFFF', header: 'rgba(240, 249, 255, 0.95)', border: '#BAE6FD', text: '#0C4A6E', mode: 'light' },
];

// DARK THEMES
export const DARK_BG_OPTIONS = [
  { label: 'Midnight Black', bg: '#070913', card: '#0F1526', header: '#0A0D18', border: 'rgba(255, 255, 255, 0.08)', text: '#F8FAFC', mode: 'dark' },
  { label: 'Slate Dark', bg: '#0D1117', card: '#161B22', header: '#12161F', border: 'rgba(48, 54, 61, 0.9)', text: '#F8FAFC', mode: 'dark' },
  { label: 'Deep Navy', bg: '#0A0F23', card: '#121934', header: '#0E132A', border: 'rgba(30, 41, 59, 0.8)', text: '#F8FAFC', mode: 'dark' },
  { label: 'Charcoal', bg: '#111318', card: '#1A1D24', header: '#14161C', border: 'rgba(60, 64, 72, 0.7)', text: '#F8FAFC', mode: 'dark' },
];

export function getInitialPrefs() {
  try {
    const saved = localStorage.getItem('sg_appearance');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not read saved appearance prefs:', err);
  }
  return {
    mode: 'light', // 'light' | 'dark'
    fontSize: 16,
    accent: ACCENT_OPTIONS[1], // Cyan accent matching localhost
    bg: LIGHT_BG_OPTIONS[0],
  };
}

export function applyPrefs(prefs) {
  if (!prefs) return;
  const root = document.documentElement;
  const isLight = prefs.mode === 'light' || prefs.bg?.mode === 'light';

  // 1. DATA-THEME ATTRIBUTE & COLOR-SCHEME (Switches entire CSS architecture)
  if (isLight) {
    root.setAttribute('data-theme', 'light');
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  } else {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  }

  // 2. ROOT FONT-SIZE SCALING (Proportional & Responsive)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const rawSize = Number(prefs.fontSize) || 16;
  // If user had legacy 18px default, map it down to standard 16px
  const userSize = rawSize === 18 && !localStorage.getItem('sg_font_custom') ? 16 : rawSize;
  const effectiveSize = isMobile ? Math.min(userSize, 15) : userSize;
  root.style.fontSize = `${effectiveSize}px`;
  root.style.setProperty('--app-font-size', `${effectiveSize}px`);

  // 3. BACKGROUND & CARD PALETTE
  if (prefs.bg) {
    root.style.setProperty('--bg-primary', prefs.bg.bg);
    root.style.setProperty('--bg-card', prefs.bg.card);
    root.style.setProperty('--bg-header', prefs.bg.header || prefs.bg.card);
    root.style.setProperty('--border-color', prefs.bg.border || (isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'));
    root.style.setProperty('--text-main', prefs.bg.text || (isLight ? '#0F172A' : '#F8FAFC'));
    
    document.body.style.backgroundColor = prefs.bg.bg;
    root.style.backgroundColor = prefs.bg.bg;
  }

  // 4. ACCENT GRADIENTS & HIGHLIGHTS
  if (prefs.accent) {
    root.style.setProperty('--accent-from', prefs.accent.from);
    root.style.setProperty('--accent-to', prefs.accent.to);
    root.style.setProperty('--accent-ring', prefs.accent.ring);
    root.style.setProperty('--primary-purple', prefs.accent.from);
  }

  // Dispatch custom event for real-time reactive sync
  window.dispatchEvent(new CustomEvent('sg_appearance_changed', { detail: prefs }));
}

export function toggleLightDarkMode() {
  const current = getInitialPrefs();
  const nextMode = current.mode === 'light' ? 'dark' : 'light';
  const nextBg = nextMode === 'light' ? LIGHT_BG_OPTIONS[0] : DARK_BG_OPTIONS[0];
  const updated = {
    ...current,
    mode: nextMode,
    bg: nextBg
  };
  applyPrefs(updated);
  try {
    localStorage.setItem('sg_appearance', JSON.stringify(updated));
  } catch {}
  return updated;
}

export default function AppearancePanel({ isOpen, onClose }) {
  const [prefs, setPrefs] = useState(getInitialPrefs);

  useEffect(() => {
    const current = getInitialPrefs();
    setPrefs(current);
    applyPrefs(current);
  }, [isOpen]);

  function updatePrefs(patch) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem('sg_appearance', JSON.stringify(next));
    } catch (err) {
      console.warn('Failed to save appearance to localStorage:', err);
    }
  }

  function handleSwitchMode(mode) {
    const defaultBg = mode === 'light' ? LIGHT_BG_OPTIONS[0] : DARK_BG_OPTIONS[0];
    updatePrefs({
      mode: mode,
      bg: defaultBg
    });
  }

  if (!isOpen) return null;

  const isLight = prefs.mode === 'light';
  const availableBgs = isLight ? LIGHT_BG_OPTIONS : DARK_BG_OPTIONS;

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in drawer */}
      <aside
        className="appearance-drawer fixed right-0 top-0 h-full z-50 flex flex-col shadow-2xl overflow-hidden"
        style={{
          width: 'min(460px, 94vw)',
          backgroundColor: isLight ? '#FFFFFF' : (prefs.bg?.card || '#0E1426'),
          borderLeft: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)',
          color: isLight ? '#0F172A' : '#F8FAFC'
        }}
      >
        {/* Drawer Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{
            borderColor: isLight ? '#E2E8F0' : '#1E293B',
            backgroundColor: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${prefs.accent.from}, ${prefs.accent.to})` }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight" style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>
                Appearance &amp; Display
              </h2>
              <p className="text-xs" style={{ color: isLight ? '#64748B' : '#94A3B8' }}>
                Choose between Light (White) or Dark (Black) mode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition"
            style={{
              backgroundColor: isLight ? '#E2E8F0' : '#1E293B',
              color: isLight ? '#475569' : '#94A3B8'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Controls */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* 1. LIGHT MODE VS DARK MODE SWITCHER (Direct fix for "screen stay black") */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isLight ? '#64748B' : '#94A3B8' }}>
                Display Mode (Light or Dark)
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow"
                style={{ background: prefs.accent.from }}
              >
                {isLight ? '☀️ Light Screen' : '🌙 Dark Screen'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Light Mode Button */}
              <button
                type="button"
                onClick={() => handleSwitchMode('light')}
                className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 font-bold transition-all text-sm cursor-pointer shadow-sm"
                style={{
                  backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
                  borderColor: isLight ? prefs.accent.from : 'rgba(255, 255, 255, 0.1)',
                  color: isLight ? '#0F172A' : '#94A3B8',
                  boxShadow: isLight ? `0 0 16px ${prefs.accent.ring}` : 'none'
                }}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Light Mode (White)</span>
                {isLight && <Check className="w-4 h-4 ml-1 text-emerald-500" />}
              </button>

              {/* Dark Mode Button */}
              <button
                type="button"
                onClick={() => handleSwitchMode('dark')}
                className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 font-bold transition-all text-sm cursor-pointer shadow-sm"
                style={{
                  backgroundColor: !isLight ? '#0B0F1A' : '#F1F5F9',
                  borderColor: !isLight ? prefs.accent.from : '#CBD5E1',
                  color: !isLight ? '#FFFFFF' : '#64748B',
                  boxShadow: !isLight ? `0 0 16px ${prefs.accent.ring}` : 'none'
                }}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>Dark Mode (Black)</span>
                {!isLight && <Check className="w-4 h-4 ml-1 text-emerald-400" />}
              </button>
            </div>
          </section>

          {/* 2. BACKGROUND COLOR PALETTES */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-400" />}
                <h3 className="text-sm font-bold" style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>
                  {isLight ? 'Light Background Palettes' : 'Dark Background Palettes'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {availableBgs.map((bgOpt) => {
                const isSelected = prefs.bg?.label === bgOpt.label;
                return (
                  <button
                    key={bgOpt.label}
                    type="button"
                    onClick={() => updatePrefs({ bg: bgOpt, mode: bgOpt.mode })}
                    className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: bgOpt.bg,
                      borderColor: isSelected ? prefs.accent.from : (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.1)'),
                      boxShadow: isSelected ? `0 0 15px ${prefs.accent.ring}` : 'none'
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border"
                      style={{
                        backgroundColor: bgOpt.card,
                        borderColor: isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>
                        {bgOpt.label}
                      </p>
                      <p className="text-[10px] font-mono opacity-70" style={{ color: isLight ? '#64748B' : '#94A3B8' }}>
                        {bgOpt.bg}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. FONT SIZE SCALING */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold" style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>
                  Font Size Scaling
                </h3>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-white shadow"
                style={{ background: prefs.accent.from }}
              >
                {prefs.fontSize}px
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={14}
              max={26}
              step={1}
              value={prefs.fontSize}
              onChange={(e) => updatePrefs({ fontSize: Number(e.target.value) })}
              className="appearance-slider"
              style={{
                background: `linear-gradient(to right, ${prefs.accent.from} ${((prefs.fontSize - 14) / 12) * 100}%, #94A3B8 ${((prefs.fontSize - 14) / 12) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs font-semibold px-0.5" style={{ color: isLight ? '#64748B' : '#94A3B8' }}>
              <span>Small (14px)</span>
              <span>Medium (18px)</span>
              <span>Large (26px)</span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {FONT_OPTIONS.map((opt) => {
                const isSelected = prefs.fontSize === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updatePrefs({ fontSize: opt.value })}
                    className="py-2.5 rounded-xl border text-center transition-all font-bold cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? prefs.accent.from : (isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.04)'),
                      borderColor: isSelected ? prefs.accent.from : (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.1)'),
                      color: isSelected ? '#FFFFFF' : (isLight ? '#475569' : '#94A3B8'),
                      boxShadow: isSelected ? `0 4px 12px ${prefs.accent.ring}` : 'none'
                    }}
                  >
                    <div className="text-xs">{opt.label}</div>
                    <div className="text-[10px] opacity-75">{opt.value}px</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. THEME ACCENT COLOR */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold" style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>
                Theme Accent Colour
              </h3>
            </div>
            
            <div className="grid grid-cols-5 gap-2.5">
              {ACCENT_OPTIONS.map((acc) => {
                const isSelected = prefs.accent.label === acc.label;
                return (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => updatePrefs({ accent: acc })}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer hover:opacity-80"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${acc.from}, ${acc.to})`,
                        outline: isSelected ? `3px solid ${isLight ? '#0F172A' : '#FFFFFF'}` : 'none',
                        outlineOffset: '2px',
                        boxShadow: isSelected ? `0 0 16px ${acc.from}` : 'none'
                      }}
                    >
                      {isSelected && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#64748B' : '#94A3B8') }}>
                      {acc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* Drawer Footer Actions */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            borderColor: isLight ? '#E2E8F0' : '#1E293B',
            backgroundColor: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              const defaults = {
                mode: 'dark',
                fontSize: 18,
                accent: ACCENT_OPTIONS[0],
                bg: DARK_BG_OPTIONS[0]
              };
              updatePrefs(defaults);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
            style={{ color: isLight ? '#64748B' : '#94A3B8' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:scale-105 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${prefs.accent.from}, ${prefs.accent.to})`,
              boxShadow: `0 4px 15px ${prefs.accent.ring}`
            }}
          >
            Apply &amp; Close
          </button>
        </div>
      </aside>
    </>
  );
}
