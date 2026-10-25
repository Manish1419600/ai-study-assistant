import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
/* All project CSS is organized in one central folder: src/styles/ */
import './styles/index.css'

// Register Progressive Web App Service Worker for 100% Offline Universal Support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => {
        console.log('⚡ StudyGenie PWA Service Worker registered for offline resilience:', reg.scope);
      },
      (err) => {
        console.warn('ServiceWorker registration skipped:', err);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
