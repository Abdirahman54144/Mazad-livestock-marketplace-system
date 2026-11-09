import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import MarketplacePage from '@/pages/MarketplacePage';
import ListingDetailPage from '@/pages/ListingDetailPage';
import SellerDashboard from '@/pages/SellerDashboard';
import BuyerOrdersPage from '@/pages/BuyerOrdersPage';
import AdminDashboard from '@/pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<MarketplacePage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/orders" element={<BuyerOrdersPage />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
