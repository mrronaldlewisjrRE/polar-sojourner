import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary'

import { DataProvider } from './contexts/DataContext'

console.log("CDH App Version: 5A.2.5-Cache-Cleanup");

// FORCE CLEANUP: Unregister any service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('ServiceWorker unregistered');
      window.location.reload(); // Force reload once to clear cache
    }
  });
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <DataProvider>
        <App />
      </DataProvider>
    </ErrorBoundary>
  </StrictMode>,
)
