import apiClient from './client'
import type { User } from '../types'

export const authApi = {
  register: (data: { email: string; password: string; full_name?: string; consent_offer?: boolean; consent_pd?: boolean }) =>
    apiClient.post<{ access_token: string }>('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<{ access_token: string }>('/api/auth/login', data),

  getMe: () => apiClient.get<User>('/api/auth/me'),

  updateMe: (data: Partial<User>) => apiClient.put<User>('/api/auth/me', data),
}
