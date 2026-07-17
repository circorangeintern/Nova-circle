import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Honour the user's reduced-motion preference across all animations */}
      <MotionConfig reducedMotion="user">
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'font-sans text-sm',
            style: { borderRadius: '12px', border: '1px solid #E5E7EB' },
            success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
          }}
        />
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
)
