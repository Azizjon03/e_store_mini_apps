import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) {
    config.headers.Authorization = `tma ${initData}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const initData = window.Telegram?.WebApp?.initData;
      if (initData) {
        error.config.headers.Authorization = `tma ${initData}`;
        return apiClient.request(error.config);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
