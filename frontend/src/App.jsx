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
import SearchVehicles from './pages/client/SearchVehicles';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyVehicles from './pages/owner/MyVehicles';
import AddVehicle from './pages/owner/AddVehicle';
import OwnerRequests from './pages/owner/OwnerRequests';
import OwnerRevenue from './pages/owner/OwnerRevenue';
import OwnerMessages from './pages/owner/OwnerMessages';
import OwnerNotifications from './pages/owner/OwnerNotifications';
import OwnerVehicleDetail from './pages/owner/OwnerVehicleDetail';
import DriverDashboard from './pages/driver/DriverDashboard';
import VehicleAudit from './pages/owner/VehicleAudit';
import DriverApplicationForm from './pages/driver/DriverApplicationForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminVehicleDetail from './pages/admin/AdminVehicleDetail';
import AdminPartners from './pages/admin/AdminPartners';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminClients from './pages/admin/AdminClients';
import AdminSettings from './pages/admin/AdminSettings';
import DriverRecruitment from './pages/admin/DriverRecruitment';
import Finance from './pages/admin/Finance';
import VehicleInspection from './pages/admin/VehicleInspection';
import ManageUsers from './pages/admin/ManageUsers';
import ControllerDashboard from './pages/controller/ControllerDashboard';
import CatalogManager from './pages/admin/CatalogManager';
import AgentsManager from './pages/admin/AgentsManager';
import Profile from './pages/Profile';
import ProfileMoko from './pages/ProfileMoko';
import SettingsMoko from './pages/SettingsMoko';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Disputes from './pages/admin/Disputes';
import ContactMessages from './pages/admin/ContactMessages';
import Newsletter from './pages/admin/Newsletter';
import LegalPages from './pages/LegalPages';
import BookingDetail from './pages/client/BookingDetail';
import Messaging from './pages/Messaging';
import Notifications from './pages/Notifications';
import ClientDashboard from './pages/client/ClientDashboard';
import MyBookings from './pages/client/MyBookings';
import Wallet from './pages/client/Wallet';
import Favorites from './pages/client/Favorites';
import D8 from './design/c8_notifications';
import DD from './design/driver_dashboard';
import DP from './design/driver_profile';
import DR from './design/driver_revenue';
import DDN from './design/driver_notifications';
import Parametres from './design/Parametres';
import Revenue from './pages/Revenue';
import RentalRequests from './pages/owner/RentalRequests';
import AdminOwners from './pages/admin/AdminOwners';
import PlatformSettings from './pages/admin/PlatformSettings';
import MaintenanceBanner from './components/MaintenanceBanner';
import D1 from './design/c1_tableau_de_bord_client';
import D2s1 from './design/c2_tunnel_tape_1_r_capitulatif';
import D2s2i from './design/c2_tunnel_tape_2_paiement_solde_insuffisant';
import D2s2s from './design/c2_tunnel_tape_2_paiement_solde_suffisant';
import D2s3 from './design/c2_tunnel_tape_3_confirmation';
import D3 from './design/c3_mes_r_servations';
import D4 from './design/c4_d_tail_d_une_r_servation';
import D4mod from './design/c4_modification_reservation';
import D5 from './design/c5_portefeuille_et_caution';
import D6 from './design/c6_favoris';
import D7 from './design/c7_messagerie';
import D9 from './design/c9_profil_et_param_tres';
import Referrals from './design/Referrals';
import DesignIndex from './design/DesignIndex';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

// Rend la bonne interface selon le rôle : Yves pour CLIENT/DRIVER,
// Moko (dev_back) pour OWNER/ADMIN/CONTROLLER/INTERMEDIARY.
const RolePage = ({ yves, moko }) => {
  const { user } = useAuth();
  const isYvesUi = ['CLIENT', 'DRIVER'].includes(user?.role);
  return isYvesUi ? yves : moko;
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
      <Route path="/help" element={<Help />} />
      <Route path="/devenir-proprietaire" element={<BecomeOwner />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/client/dashboard" element={<Guard roles={['CLIENT']}><D1 /></Guard>} />
      <Route path="/client/search" element={<Guard roles={['CLIENT']}><SearchVehicles /></Guard>} />
      <Route path="/client/bookings" element={<Guard roles={['CLIENT']}><D3 /></Guard>} />
      <Route path="/client/booking/recap" element={<Guard roles={['CLIENT']}><D2s1 /></Guard>} />
      <Route path="/client/booking/paiement" element={<Guard roles={['CLIENT']}><D2s2s /></Guard>} />
      <Route path="/client/booking/paiement-insuffisant" element={<Guard roles={['CLIENT']}><D2s2i /></Guard>} />
      <Route path="/client/booking/confirmation" element={<Guard roles={['CLIENT']}><D2s3 /></Guard>} />
      <Route path="/client/settings" element={<Guard roles={['CLIENT']}><Parametres /></Guard>} />
      <Route path="/client/referrals" element={<Guard roles={['CLIENT']}><Referrals /></Guard>} />
      <Route path="/client/bookings/:id" element={<Guard roles={['CLIENT']}><D4 /></Guard>} />
      <Route path="/client/bookings/:id/modifier" element={<Guard roles={['CLIENT']}><D4mod /></Guard>} />
      <Route path="/client/favorites" element={<Guard roles={['CLIENT']}><D6 /></Guard>} />
      <Route path="/client/wallet" element={<Guard roles={['CLIENT']}><D5 /></Guard>} />

      <Route path="/owner/dashboard" element={<Guard roles={['OWNER']}><OwnerDashboard /></Guard>} />
      <Route path="/owner/vehicles" element={<Guard roles={['OWNER']}><MyVehicles /></Guard>} />
      <Route path="/owner/vehicles/:id" element={<Guard roles={['OWNER']}><OwnerVehicleDetail /></Guard>} />
      <Route path="/owner/add-vehicle" element={<Guard roles={['OWNER']}><AddVehicle /></Guard>} />
      <Route path="/owner/requests" element={<Guard roles={['OWNER']}><OwnerRequests /></Guard>} />
      <Route path="/owner/messages" element={<Guard roles={['OWNER']}><OwnerMessages /></Guard>} />
      <Route path="/owner/notifications" element={<Guard roles={['OWNER']}><OwnerNotifications /></Guard>} />
      <Route path="/owner/revenue" element={<Guard roles={['OWNER']}><OwnerRevenue /></Guard>} />

      <Route path="/driver/dashboard" element={<Guard roles={['DRIVER']}><DD /></Guard>} />
      <Route path="/driver/revenue" element={<DR />} />
      <Route path="/driver/application" element={<Guard><DriverApplicationForm /></Guard>} />
      <Route path="/driver/notifications" element={<Guard roles={['DRIVER']}><DDN /></Guard>} />
      <Route path="/driver/messages" element={<Guard roles={['DRIVER']}><D7 role="driver" /></Guard>} />
      <Route path="/driver/profile" element={<Guard roles={['DRIVER']}><DP /></Guard>} />
      <Route path="/driver/settings" element={<Guard roles={['DRIVER']}><Parametres role="driver" /></Guard>} />

      <Route path="/admin/dashboard" element={<Guard roles={['ADMIN']}><AdminDashboard /></Guard>} />
      <Route path="/admin/reservations" element={<Guard roles={['ADMIN']}><AdminBookings /></Guard>} />
      <Route path="/admin/reservations/:id" element={<Guard roles={['ADMIN']}><AdminBookingDetail /></Guard>} />
      <Route path="/admin/vehicles/:id" element={<Guard roles={['ADMIN']}><AdminVehicleDetail /></Guard>} />
      <Route path="/admin/partenaires" element={<Guard roles={['ADMIN']}><AdminPartners /></Guard>} />
      <Route path="/admin/litiges" element={<Guard roles={['ADMIN']}><AdminDisputes /></Guard>} />
      <Route path="/admin/clients" element={<Guard roles={['ADMIN']}><AdminClients /></Guard>} />
      <Route path="/admin/drivers" element={<Guard roles={['ADMIN']}><DriverRecruitment /></Guard>} />
      <Route path="/admin/finance" element={<Guard roles={['ADMIN']}><Finance /></Guard>} />
      <Route path="/admin/inspections" element={<Guard roles={['ADMIN', 'CONTROLLER']}><VehicleInspection /></Guard>} />
      <Route path="/admin/users" element={<Guard roles={['ADMIN']}><ManageUsers /></Guard>} />
      <Route path="/admin/catalog" element={<Guard roles={['ADMIN']}><CatalogManager /></Guard>} />
      <Route path="/admin/agents" element={<Guard roles={['ADMIN']}><AgentsManager /></Guard>} />
      <Route path="/admin/settings" element={<Guard roles={['ADMIN']}><AdminSettings /></Guard>} />

      <Route path="/controller/dashboard" element={<Guard roles={['ADMIN', 'CONTROLLER']}><ControllerDashboard /></Guard>} />

      {/* Pages communes à tous les rôles connectés */}
      <Route path="/profile" element={<Guard><RolePage yves={<D9 />} moko={<ProfileMoko />} /></Guard>} />
      <Route path="/settings" element={<Guard><RolePage yves={<Parametres />} moko={<SettingsMoko />} /></Guard>} />
      <Route path="/messages" element={<Guard roles={['CLIENT', 'DRIVER']}><D7 /></Guard>} />
      <Route path="/notifications" element={<Guard roles={['CLIENT', 'DRIVER']}><D8 /></Guard>} />

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
