// src/components/PullToRefresh.jsx - Pull-to-Refresh & Global App Refresh for Mobile APK & Web
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';

export default function PullToRefresh({ children, onRefresh }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const pullDistanceRef = useRef(0);

  const TRIGGER_THRESHOLD = 70; // px to trigger refresh
  const MAX_PULL = 110;

  const triggerAppRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setToastMessage('Refreshing StudyGenie...');
    setShowToast(true);

    try {
      // Haptic feedback for mobile devices / APK
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(40);
      }

      // Broadcast custom event so all active tabs reload their backend data
      window.dispatchEvent(new CustomEvent('studygenie_refresh'));

      if (onRefresh) {
        await onRefresh();
      }

      // Wait a minimum time for smooth UX spinner
      await new Promise(r => setTimeout(r, 700));
      setToastMessage('Refreshed & Synced!');
      setTimeout(() => setShowToast(false), 1800);
    } catch (err) {
      console.warn('Refresh error:', err);
      setToastMessage('Refresh complete');
      setTimeout(() => setShowToast(false), 1500);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      pullDistanceRef.current = 0;
    }
  };

  // Listen for global trigger (e.g. from Header refresh button or keyboard shortcuts)
  useEffect(() => {
    const handleGlobalTrigger = (e) => {
      if (e.detail?.fullReload) {
        window.location.reload();
      } else {
        triggerAppRefresh();
      }
    };

    window.addEventListener('studygenie_trigger_refresh', handleGlobalTrigger);
    return () => window.removeEventListener('studygenie_trigger_refresh', handleGlobalTrigger);
  }, [isRefreshing]);

  // Touch handlers for mobile pull-to-refresh
  const handleTouchStart = (e) => {
    if (window.scrollY === 0 || document.documentElement.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Only activate when pulling down at the very top of the page
    if (diff > 0 && (window.scrollY === 0 || document.documentElement.scrollTop === 0)) {
      // Apply resistance dampening curve
      const distance = Math.min(diff * 0.45, MAX_PULL);
      pullDistanceRef.current = distance;
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistanceRef.current >= TRIGGER_THRESHOLD) {
      triggerAppRefresh();
    } else {
      setPullDistance(0);
      pullDistanceRef.current = 0;
    }
  };

  const isReadyToTrigger = pullDistance >= TRIGGER_THRESHOLD;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen flex flex-col"
    >
      {/* Visual Pull Indicator Capsule (Mobile & APK) */}
      {(pullDistance > 10 || isRefreshing) && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-transform duration-200 pointer-events-none"
          style={{
            transform: `translate(-50%, ${isRefreshing ? 12 : Math.min(pullDistance * 0.7, 45)}px)`,
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/95 border border-cyan-500/40 text-slate-100 shadow-xl shadow-cyan-950/40 backdrop-blur-md text-xs font-bold">
            <RefreshCw
              className={`w-4 h-4 text-cyan-400 ${
                isRefreshing
                  ? 'animate-spin'
                  : ''
              }`}
              style={{
                transform: !isRefreshing ? `rotate(${pullDistance * 3.5}deg)` : undefined,
                transition: isRefreshing ? 'none' : 'transform 0.1s ease',
              }}
            />
            <span>
              {isRefreshing
                ? 'Syncing with database...'
                : isReadyToTrigger
                ? 'Release to refresh'
                : 'Pull down to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Floating Refresh Confirmation Toast */}
      {showToast && (
        <div className="fixed bottom-24 lg:bottom-8 right-6 z-50 animate-bounce pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-slate-100 shadow-xl shadow-cyan-950/40 backdrop-blur-md text-xs font-bold">
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* App Body with elastic pull translation */}
      <div
        style={{
          transform: pullDistance > 0 && !isRefreshing ? `translateY(${pullDistance * 0.25}px)` : 'none',
          transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease-out',
        }}
        className="flex-1 flex flex-col"
      >
        {children}
      </div>
    </div>
  );
}
