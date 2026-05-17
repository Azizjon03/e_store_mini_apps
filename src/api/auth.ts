import apiClient from './client';
import type { AuthResponse, AuthUser } from './types';

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  password_confirmation: string;
  email?: string;
  telegram_id?: string | null;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export const register = (data: RegisterPayload) =>
  apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const login = (data: LoginPayload) =>
  apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const me = () =>
  apiClient.get<{ data: AuthUser }>('/auth/me').then((r) => r.data.data);

export const logout = () => apiClient.post('/auth/logout').then((r) => r.data);
