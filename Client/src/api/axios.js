import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  const adminInfo = localStorage.getItem('adminInfo');
  const driverInfo = localStorage.getItem('driverInfo');
  const info = userInfo ? JSON.parse(userInfo) : adminInfo ? JSON.parse(adminInfo) : driverInfo ? JSON.parse(driverInfo) : null;
  if (info?.token) {
    config.headers.Authorization = `Bearer ${info.token}`;
  }
  return config;
});

// Handle 401 errors
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
