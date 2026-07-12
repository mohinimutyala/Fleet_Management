import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach correct JWT token based on current portal
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  const adminInfo = localStorage.getItem('adminInfo');
  const driverInfo = localStorage.getItem('driverInfo');

  let info = null;
  const path = window.location.pathname;

  if (path.startsWith('/admin')) {
    info = adminInfo ? JSON.parse(adminInfo) : null;
  } else if (path.startsWith('/driver')) {
    info = driverInfo ? JSON.parse(driverInfo) : null;
  } else {
    info = userInfo ? JSON.parse(userInfo) : null;
  }

  if (info?.token) {
    config.headers.Authorization = `Bearer ${info.token}`;
  }

  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('driverInfo');
    }

    return Promise.reject(err);
  }
);

export default api;