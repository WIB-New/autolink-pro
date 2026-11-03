import axios from 'axios';

// URL de l'API — priorité à REACT_APP_API_URL (build), sinon déduction au
// runtime : sur *.worldwide-international.business → sous-domaine api-,
// ailleurs (local) → localhost:8000.
function resolveApiUrl() {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const host = window.location.hostname.replace(/^www\./, '');
  if (host.endsWith('.worldwide-international.business')) {
    return `https://api-${host}/api`;
  }
  return 'http://localhost:8000/api';
}
const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// Injecte le token JWT sur chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autolink_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = localStorage.getItem('lang') || 'fr';
  return config;
});

// Déconnexion auto si token expiré
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && localStorage.getItem('autolink_refresh')) {
      try {
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: localStorage.getItem('autolink_refresh'),
        });
        localStorage.setItem('autolink_access', data.access);
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return api.request(err.config);
      } catch (_) {
        localStorage.removeItem('autolink_access');
        localStorage.removeItem('autolink_refresh');
        localStorage.removeItem('autolink_user');
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/users/login/', { email, password }),
  register: (payload) => api.post('/users/register/', payload),
  google: (payload) => api.post('/users/google/', payload),
  otpRequest: (payload) => api.post('/users/otp/request/', payload),
  otpVerify: (email, code) => api.post('/users/otp/verify/', { email, code }),
  me: () => api.get('/users/me/'),
};

export const vehiclesAPI = {
  list: (params) => api.get('/vehicles/', { params }),
  getAll: (params) => api.get('/vehicles/', { params }),
  detail: (id) => api.get(`/vehicles/${id}/`),
  create: (payload) => api.post('/vehicles/', payload),
  update: (id, payload) => api.patch(`/vehicles/${id}/`, payload),
  delete: (id) => api.delete(`/vehicles/${id}/`),
  uploadMedia: (id, payload) => api.post(`/vehicles/${id}/media/`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  media: (id) => api.get(`/vehicles/${id}/media/`),
  deleteMedia: (id, mediaId) => api.delete(`/vehicles/${id}/media/${mediaId}/`),
  availability: (id) => api.get(`/vehicles/${id}/availability/`),
  blockDates: (id, start_date, end_date, reason) => api.post(`/vehicles/${id}/availability/`, { start_date, end_date, reason }),
  facets: () => api.get('/vehicles/facets/'),
  favorites: () => api.get('/vehicles/favorites/'),
  addFavorite: (vehicle) => api.post('/vehicles/favorites/', { vehicle }),
  removeFavorite: (vehicle) => api.delete(`/vehicles/favorites/${vehicle}/`),
  reviews: (id) => api.get(`/vehicles/${id}/reviews/`),
  similar: (id) => api.get(`/vehicles/${id}/similar/`),
};

export const adminVehiclesAPI = {
  list: (params) => api.get('/vehicles/admin/', { params }),
  update: (id, payload) => api.patch(`/vehicles/admin/${id}/`, payload),
  delete: (id) => api.delete(`/vehicles/admin/${id}/`),
};

export const bookingsAPI = {
  list: (params) => api.get('/bookings/', { params }),
  getAll: (params) => api.get('/bookings/', { params }),
  detail: (id) => api.get(`/bookings/${id}/`),
  create: (payload) => api.post('/bookings/', payload),
  update: (id, payload) => api.patch(`/bookings/${id}/`, payload),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/`, { status }),
  acceptDriverRide: (id) => api.post(`/bookings/${id}/driver-accept/`),
  refuseDriverRide: (id) => api.post(`/bookings/${id}/driver-refuse/`),
  dispute: (id, reason) => api.post(`/bookings/${id}/dispute/`, { reason }),
  resolveDispute: (id, decision) => api.post(`/bookings/${id}/resolve-dispute/`, { decision }),
  disputes: (params) => api.get('/bookings/disputes/', { params }),
  stats: () => api.get('/bookings/stats/'),
  clientStats: () => api.get('/bookings/client-stats/'),
  clientDashboard: () => api.get('/bookings/client-dashboard/'),
  receipt: (id) => api.get(`/bookings/${id}/receipt/`, { responseType: 'blob' }),
  emailReceipt: (id) => api.post(`/bookings/${id}/receipt/email/`),
  rate: (id, rating, review) => api.post(`/bookings/${id}/rate/`, { rating, review }),
  ownerRequests: (params) => api.get('/bookings/owner-requests/', { params }),
  ownerAccept: (id) => api.post(`/bookings/${id}/owner-accept/`),
  ownerRefuse: (id, reason) => api.post(`/bookings/${id}/owner-refuse/`, { reason }),
  ownerStats: () => api.get('/bookings/owner-stats/'),
};

export const messagingAPI = {
  conversations: (params) => api.get('/messaging/conversations/', { params }),
  open: (payload) => api.post('/messaging/conversations/', payload),
  messages: (id) => api.get(`/messaging/conversations/${id}/messages/`),
  send: (id, payload) => api.post(`/messaging/conversations/${id}/messages/`, payload,
    payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  unread: () => api.get('/messaging/unread/'),
};

export const withdrawalsAPI = {
  list: (params) => api.get('/payments/withdrawals/', { params }),
  create: (payload) => api.post('/payments/withdrawals/', payload),
  approve: (id, note) => api.post(`/payments/withdrawals/${id}/approve/`, { note }),
  reject: (id, note) => api.post(`/payments/withdrawals/${id}/reject/`, { note }),
};

export const platformAPI = {
  get: () => api.get('/users/platform-settings/'),
  update: (payload) => api.patch('/users/platform-settings/', payload),
  activity: () => api.get('/users/admin/activity/'),
};

export const kycAPI = {
  upload: (formData) => api.post('/users/me/kyc/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const notificationsAPI = {
  list: (params) => api.get('/users/notifications/', { params }),
  readAll: () => api.post('/users/notifications/read/'),
  read: (id) => api.post(`/users/notifications/${id}/read/`),
  remove: (id) => api.delete(`/users/notifications/${id}/`),
};

export const siteAPI = {
  config: () => api.get('/site-config/'),
};

export const contactAPI = {
  send: (payload) => api.post('/contact/', payload),
};

export const contactMessagesAPI = {
  list: (params) => api.get('/contact/messages/', { params }),
  update: (id, payload) => api.patch(`/contact/messages/${id}/`, payload),
  delete: (id) => api.delete(`/contact/messages/${id}/`),
};

export const newsletterAPI = {
  campaigns: (params) => api.get('/users/newsletter/campaigns/', { params }),
  send: (payload) => api.post('/users/newsletter/send/', payload),
  resend: (id) => api.post(`/users/newsletter/campaigns/${id}/resend/`),
  update: (id, payload) => api.patch(`/users/newsletter/campaigns/${id}/`, payload),
  delete: (id) => api.delete(`/users/newsletter/campaigns/${id}/`),
};

export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  getAll: (params) => api.get('/users/', { params }),
  create: (payload) => api.post('/users/', payload),
  update: (id, payload) => api.patch(`/users/${id}/`, payload),
  delete: (id) => api.delete(`/users/${id}/`),
  me: () => api.get('/users/me/'),
  updateMe: (payload) => api.patch('/users/me/', payload),
  referral: () => api.get('/users/me/referral/'),
};

export const walletAPI = {
  get: () => api.get('/payments/wallet/'),
  topup: (amount, method, phone) => api.post('/payments/wallet/topup/', { amount, method, phone }),
  status: (reference) => api.get(`/payments/wallet/transactions/${encodeURIComponent(reference)}/status/`),
  methods: () => api.get('/payments/methods/'),
};
export const paymentsAPI = {
  methods: () => api.get('/payments/methods/'),
  bookingStatus: (reference) => api.get(`/payments/bookings/${reference}/status/`),
};
export const financeAPI = {
  stats: () => api.get('/payments/finance/stats/'),
  transactions: (params) => api.get('/payments/finance/transactions/', { params }),
  exportTransactions: (params) => api.get('/payments/finance/transactions/export/', {
    params, responseType: 'blob',
  }),
};
export const payoutsAPI = {
  list: (params) => api.get('/payments/payouts/', { params }),
};
export const driversAPI = {
  applications: (params) => api.get('/drivers/applications/', { params }),
  createApplication: (payload) => api.post('/drivers/applications/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateApplication: (id, payload) => api.patch(`/drivers/applications/${id}/`, payload, {
    headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  }),
  adminApplications: (params) => api.get('/drivers/admin/applications/', { params }),
  updateAdminApplication: (id, payload) => api.patch(`/drivers/admin/applications/${id}/`, payload),
  profiles: (params) => api.get('/drivers/profiles/', { params }),
  adminProfiles: (params) => api.get('/drivers/admin/profiles/', { params }),
  availability: (is_online) => api.patch('/drivers/profiles/availability/', { is_online }),
  earnings: () => api.get('/drivers/profiles/earnings/'),
  earningLedger: (params) => api.get('/drivers/earnings/', { params }),
};

export const inspectionsAPI = {
  queue: (params) => api.get('/inspections/queue/', { params }),
  dashboard: () => api.get('/inspections/dashboard/'),
  list: (params) => api.get('/inspections/', { params }),
  create: (payload) => api.post('/inspections/', payload, payload instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
};

export const controllerVehiclesAPI = {
  list: (params) => api.get('/vehicles/controller-review/', { params }),
  decide: (id, status) => api.patch(`/vehicles/controller-review/${id}/`, { status }),
};

export const affiliatesAPI = {
  agents: (params) => api.get('/affiliates/agents/', { params }),
  createAgent: (payload) => api.post('/affiliates/agents/', payload),
  updateAgent: (id, payload) => api.patch(`/affiliates/agents/${id}/`, payload),
  payouts: (params) => api.get('/affiliates/payouts/', { params }),
  createPayout: (payload) => api.post('/affiliates/payouts/', payload),
};

export default api;
