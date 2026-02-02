import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import VendorManagement from './pages/VendorManagement';
import RetailerManagement from './pages/RetailerManagement';
import ProductManagement from './pages/ProductManagement';
import OrderHistory from './pages/OrderHistory';

import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';

const Analytics = () => <div className="p-8"><h2 className="text-2xl font-bold">Analytics</h2><p>Coming soon...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new-order" element={<NewOrder />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="retailers" element={<RetailerManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
