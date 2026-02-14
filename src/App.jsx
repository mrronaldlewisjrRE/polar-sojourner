import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import Calendar from './pages/Calendar';
import VendorManagement from './pages/VendorManagement';
import RetailerManagement from './pages/RetailerManagement';
import ProductManagement from './pages/ProductManagement';
import SKUTrackerDashboard from './pages/SKUTrackerDashboard';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import DataImportStaging from './pages/DataImportStaging';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';
import Debug from './pages/Debug';
// import Analytics from './pages/Analytics'; // Component missing

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="import-staging" element={<DataImportStaging />} />
            <Route path="gallery" element={<Gallery />} />

            {/* <Route path="analytics" element={<Analytics />} /> */}

            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            <Route path="profile" element={<Profile />} />
            <Route path="debug" element={<Debug />} />
            {/* Catch all redirect to home (which is guarded) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
