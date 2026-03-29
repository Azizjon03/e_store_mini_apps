import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Company-Id': '1',
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
    const config = error.config;
    if (error.response?.status === 401 && !config._retried) {
      config._retried = true;
      const initData = window.Telegram?.WebApp?.initData;
      if (initData) {
        config.headers.Authorization = `tma ${initData}`;
        return apiClient.request(config);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
