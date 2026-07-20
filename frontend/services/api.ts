import axios from 'axios';
import { TokenStorage } from '../lib/token-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = TokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = TokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");
        
        const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
        const { access_token, refresh_token: new_refresh_token } = res.data;
        
        TokenStorage.setAccessToken(access_token);
        TokenStorage.setRefreshToken(new_refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (err) {
        TokenStorage.clearTokens();
        if (typeof window !== 'undefined') {
          const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
          if (!publicPaths.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
