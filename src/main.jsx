import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary'

import { DataProvider } from './contexts/DataContext'

console.log("CDH App Version: 5A.2.4-Downgrade-RRD");
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <DataProvider>
        <App />
      </DataProvider>
    </ErrorBoundary>
  </StrictMode>,
)
