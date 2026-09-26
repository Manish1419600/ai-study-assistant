import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
/* All project CSS is organized in one central folder: src/styles/ */
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
