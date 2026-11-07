import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LandingPage from '../pages/LandingPage';
import AboutPage from '../pages/AboutPage';
import ServicesPage from '../pages/ServicesPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CustomerDashboard from '../pages/CustomerDashboard';
import WorkerDashboard from '../pages/WorkerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import SearchWorkersPage from '../pages/SearchWorkersPage';
import WorkerProfilePage from '../pages/WorkerProfilePage';
import BookingPage from '../pages/BookingPage';
import EstimateApprovalPage from '../pages/EstimateApprovalPage';
import BookingHistoryPage from '../pages/BookingHistoryPage';
import ReviewPage from '../pages/ReviewPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RequireAuth = ({ children, roles }) => {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'worker' ? '/dashboard/worker' : user.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer'} replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/workers" element={<SearchWorkersPage />} />
      <Route path="/search-workers" element={<SearchWorkersPage />} />
      <Route path="/workers/:id" element={<WorkerProfilePage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/dashboard/customer" element={<RequireAuth roles={['customer']}><CustomerDashboard /></RequireAuth>} />
      <Route path="/dashboard/worker" element={<RequireAuth roles={['worker']}><WorkerDashboard /></RequireAuth>} />
      <Route path="/dashboard/admin" element={<RequireAuth roles={['admin']}><AdminDashboard /></RequireAuth>} />
      <Route path="/book/:workerId" element={<RequireAuth roles={['customer']}><BookingPage /></RequireAuth>} />
      <Route path="/booking/:id/estimate" element={<RequireAuth roles={['customer']}><EstimateApprovalPage /></RequireAuth>} />
      <Route path="/bookings" element={<RequireAuth roles={['customer', 'worker', 'admin']}><BookingHistoryPage /></RequireAuth>} />
      <Route path="/booking/:id/review" element={<RequireAuth roles={['customer']}><ReviewPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth roles={['customer', 'worker', 'admin']}><ProfilePage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth roles={['customer', 'worker', 'admin']}><SettingsPage /></RequireAuth>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
);

export default AppRoutes;
