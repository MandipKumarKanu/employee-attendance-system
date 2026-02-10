import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#292524',
            color: '#F5F5F4',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 10px 25px -5px rgba(28, 25, 23, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F5F5F4',
            },
          },
          error: {
            iconTheme: {
              primary: '#F43F5E',
              secondary: '#F5F5F4',
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
