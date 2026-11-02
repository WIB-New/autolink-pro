import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import VehicleDetail from './pages/VehicleDetail';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import Help from './pages/Help';
import BecomeOwner from './pages/BecomeOwner';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/ClientDashboard';
import SearchVehicles from './pages/client/SearchVehicles';
import MyBookings from './pages/client/MyBookings';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyVehicles from './pages/owner/MyVehicles';
import AddVehicle from './pages/owner/AddVehicle';
import OwnerRequests from './pages/owner/OwnerRequests';
import OwnerRevenue from './pages/owner/OwnerRevenue';
import OwnerVehicleDetail from './pages/owner/OwnerVehicleDetail';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminVehicleDetail from './pages/admin/AdminVehicleDetail';
import AdminPartners from './pages/admin/AdminPartners';
import AdminPartnerDetail from './pages/admin/AdminPartnerDetail';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminClients from './pages/admin/AdminClients';
import AdminClientDetail from './pages/admin/AdminClientDetail';
import AdminSettings from './pages/admin/AdminSettings';
import DriverRecruitment from './pages/admin/DriverRecruitment';
import Finance from './pages/admin/Finance';
import VehicleInspection from './pages/admin/VehicleInspection';
import ManageUsers from './pages/admin/ManageUsers';
import ControllerDashboard from './pages/controller/ControllerDashboard';
import CatalogManager from './pages/admin/CatalogManager';
import AgentsManager from './pages/admin/AgentsManager';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const Guard = ({ roles, children }) => <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/catalogue" element={<Catalog />} />
      <Route path="/vehicule/:id" element={<VehicleDetail />} />
      <Route path="/comment-ca-marche" element={<HowItWorks />} />
      <Route path="/tarifs" element={<Pricing />} />
      <Route path="/aide" element={<Help />} />
      <Route path="/devenir-proprietaire" element={<BecomeOwner />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/client/dashboard" element={<Guard roles={['CLIENT']}><ClientDashboard /></Guard>} />
      <Route path="/client/search" element={<Guard roles={['CLIENT']}><SearchVehicles /></Guard>} />
      <Route path="/client/bookings" element={<Guard roles={['CLIENT']}><MyBookings /></Guard>} />

      <Route path="/owner/dashboard" element={<Guard roles={['OWNER']}><OwnerDashboard /></Guard>} />
      <Route path="/owner/vehicles" element={<Guard roles={['OWNER']}><MyVehicles /></Guard>} />
      <Route path="/owner/vehicles/:id" element={<Guard roles={['OWNER']}><OwnerVehicleDetail /></Guard>} />
      <Route path="/owner/add-vehicle" element={<Guard roles={['OWNER']}><AddVehicle /></Guard>} />
      <Route path="/owner/requests" element={<Guard roles={['OWNER']}><OwnerRequests /></Guard>} />
      <Route path="/owner/revenue" element={<Guard roles={['OWNER']}><OwnerRevenue /></Guard>} />

      <Route path="/driver/dashboard" element={<Guard roles={['DRIVER']}><DriverDashboard /></Guard>} />

      <Route path="/admin/dashboard" element={<Guard roles={['ADMIN']}><AdminDashboard /></Guard>} />
      <Route path="/admin/reservations" element={<Guard roles={['ADMIN']}><AdminBookings /></Guard>} />
      <Route path="/admin/reservations/:id" element={<Guard roles={['ADMIN']}><AdminBookingDetail /></Guard>} />
      <Route path="/admin/vehicles/:id" element={<Guard roles={['ADMIN']}><AdminVehicleDetail /></Guard>} />
      <Route path="/admin/partenaires" element={<Guard roles={['ADMIN']}><AdminPartners /></Guard>} />
      <Route path="/admin/partenaires/:id" element={<Guard roles={['ADMIN']}><AdminPartnerDetail /></Guard>} />
      <Route path="/admin/litiges" element={<Guard roles={['ADMIN']}><AdminDisputes /></Guard>} />
      <Route path="/admin/clients" element={<Guard roles={['ADMIN']}><AdminClients /></Guard>} />
      <Route path="/admin/clients/:id" element={<Guard roles={['ADMIN']}><AdminClientDetail /></Guard>} />
      <Route path="/admin/drivers" element={<Guard roles={['ADMIN']}><DriverRecruitment /></Guard>} />
      <Route path="/admin/finance" element={<Guard roles={['ADMIN']}><Finance /></Guard>} />
      <Route path="/admin/inspections" element={<Guard roles={['ADMIN', 'CONTROLLER']}><VehicleInspection /></Guard>} />
      <Route path="/admin/users" element={<Guard roles={['ADMIN']}><ManageUsers /></Guard>} />
      <Route path="/admin/catalog" element={<Guard roles={['ADMIN']}><CatalogManager /></Guard>} />
      <Route path="/admin/agents" element={<Guard roles={['ADMIN']}><AgentsManager /></Guard>} />
      <Route path="/admin/settings" element={<Guard roles={['ADMIN']}><AdminSettings /></Guard>} />

      <Route path="/controller/dashboard" element={<Guard roles={['ADMIN', 'CONTROLLER']}><ControllerDashboard /></Guard>} />

      {/* Pages communes à tous les rôles connectés */}
      <Route path="/profile" element={<Guard><Profile /></Guard>} />
      <Route path="/settings" element={<Guard><Settings /></Guard>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
