import apiClient from './client'
import type { Client } from '../types'

export const clientsApi = {
  list: () => apiClient.get<Client[]>('/api/clients'),

  get: (id: string) => apiClient.get<Client>(`/api/clients/${id}`),

  create: (data: { name: string; phone?: string; notes?: string }) =>
    apiClient.post<Client>('/api/clients', data),

  update: (id: string, data: Partial<Client>) =>
    apiClient.put<Client>(`/api/clients/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/clients/${id}`),
}
