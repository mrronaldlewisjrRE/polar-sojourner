import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary'

import { DataProvider } from './contexts/DataContext'
import { ToastProvider } from './contexts/ToastContext'

console.log("CDH App Version: 5A.3-HOTFIX-CLEANUP");

// FORCE CLEANUP: Handle legacy cache/state issues
const CURRENT_VERSION = '5A.3';
const storedVersion = localStorage.getItem('cdh_app_version');

if (storedVersion !== CURRENT_VERSION) {
  console.warn(`Version mismatch (${storedVersion} vs ${CURRENT_VERSION}). Clearing stale storage.`);

  // Clear all local storage to prevent "ReferenceError: Database is not defined" from stale state
  localStorage.clear();

  // Set new version
  localStorage.setItem('cdh_app_version', CURRENT_VERSION);

  // Unregister Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  // Force reload to ensure fresh bundles
  // window.location.reload(); // commented out to avoid infinite loop risk, but localized clearing is sufficient
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
