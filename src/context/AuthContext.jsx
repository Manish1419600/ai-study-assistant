// src/context/AuthContext.jsx - Global User Authentication & Real-Time Socket Context (FR1)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();

const rawBackend = import.meta.env.VITE_BACKEND_URL;
export const SOCKET_URL = rawBackend ? rawBackend.replace(/\/api\/?$/, '') : `http://${window.location.hostname}:5000`;
export const API_BASE_URL = rawBackend ? (rawBackend.endsWith('/api') ? rawBackend : `${rawBackend}/api`) : `http://${window.location.hostname}:5000/api`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studygenie_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('studygenie_token') || '');
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Initialize Real-Time WebSocket Connection
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      console.log('⚡ Real-time Socket connected:', s.id);
      setIsSocketConnected(true);
      const currentUid = user?.id || user?._id;
      if (currentUid) {
        s.emit('join_user_room', currentUid);
      }
    });

    s.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('studygenie_token', token);
    } else {
      localStorage.removeItem('studygenie_token');
    }
  }, [token]);

  // Sync user to localStorage and join socket room
  useEffect(() => {
    if (user) {
      localStorage.setItem('studygenie_user', JSON.stringify(user));
      const uid = user.id || user._id;
      if (socket && uid) {
        socket.emit('join_user_room', uid);
      }
    } else {
      localStorage.removeItem('studygenie_user');
    }
  }, [user, socket]);

  // Helper function for authenticated API requests
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    let response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      // Automatic port fallback if 5000 is busy
      if (url.includes(':5000')) {
        const fallbackUrl = url.replace(':5000', ':5001');
        response = await fetch(fallbackUrl, { ...options, headers });
      } else {
        throw err;
      }
    }
    return response;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setToken(data.token);
      setUser(data.user);
      if (socket && data.user) {
        socket.emit('join_user_room', data.user.id || data.user._id);
      }
      setIsAuthModalOpen(false);
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, university, major) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, university, major })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setToken(data.token);
      setUser(data.user);
      if (socket && data.user) {
        socket.emit('join_user_room', data.user.id || data.user._id);
      }
      setIsAuthModalOpen(false);
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    if (socket && (user?.id || user?._id)) {
      socket.emit('leave_user_room', user.id || user._id);
    }
    setToken('');
    setUser(null);
    localStorage.removeItem('studygenie_token');
    localStorage.removeItem('studygenie_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        authFetch,
        socket,
        isSocketConnected,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
