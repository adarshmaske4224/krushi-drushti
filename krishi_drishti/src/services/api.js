import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('km_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

export const priceAPI = {
  getPrice: (commodity, state, market, district) =>
    api.get('/api/prices', { params: { commodity, state, market, district } }),
};

export const pestAPI = {
  detect: (formData) => api.post('/api/pest/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/api/pest/history'),
};

export const weatherAPI = {
  predict: (district, state, cropType) =>
    api.get('/api/weather/pest-prediction', { params: { district, state, cropType } }),
};

export const schemeAPI = {
  getAll: () => api.get('/api/schemes/all'),
  getRecommendations: () => api.get('/api/schemes/recommendations'),
};

export const smsAPI = {
  sendPestAlert: (district, pestName, cropType) =>
    api.post('/api/sms/pest-alert', null, { params: { district, pestName, cropType } }),
  sendPriceAlert: (district, cropType, currentPrice, thresholdPrice) =>
    api.post('/api/sms/price-alert', null, { params: { district, cropType, currentPrice, thresholdPrice } }),
  sendWeatherAlert: (district, condition, advice) =>
    api.post('/api/sms/weather-alert', null, { params: { district, condition, advice } }),
  sendCustom: (data) => api.post('/api/sms/send', data),
  getHistory: () => api.get('/api/sms/history'),
};

export const chatAPI = {
  ask: (data) => api.post('/api/chat/ask', data),
};

export const cropRecommendAPI = {
  getRecommendations: (data) =>
    api.post('/api/crops/recommend', data),
};

export default api;