import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import VendorManagement from './pages/VendorManagement';
import RetailerManagement from './pages/RetailerManagement';
import ProductManagement from './pages/ProductManagement';
import OrderHistory from './pages/OrderHistory';
import Calendar from './pages/Calendar';

import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';

const Analytics = () => <div className="p-8"><h2 className="text-2xl font-bold">Analytics</h2><p>Coming soon...</p></div>;

import SKUTrackerDashboard from './pages/SKUTrackerDashboard';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            <Route path="new-order" element={<NewOrder />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="vendors" element={<VendorManagement />} />
            <Route path="retailers" element={<RetailerManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="sku-tracker" element={<SKUTrackerDashboard />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="analytics" element={<Analytics />} />
            {/* Catch all redirect to home (which is guarded) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
