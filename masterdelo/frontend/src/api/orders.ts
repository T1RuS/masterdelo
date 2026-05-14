import apiClient from './client'
import type { Order, OrderDetail, OrderCreateData, OrderUpdateData, OrderStatus } from '../types'

export const ordersApi = {
  list: (params?: {
    status?: OrderStatus
    client_id?: string
    search?: string
    deadline_from?: string
    deadline_to?: string
  }) => apiClient.get<Order[]>('/api/orders', { params }),

  get: (id: string) => apiClient.get<OrderDetail>(`/api/orders/${id}`),

  create: (data: OrderCreateData) => apiClient.post<Order>('/api/orders', data),

  update: (id: string, data: OrderUpdateData) =>
    apiClient.put<Order>(`/api/orders/${id}`, data),

  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<Order>(`/api/orders/${id}/status`, { status }),

  delete: (id: string) => apiClient.delete(`/api/orders/${id}`),

  share: (id: string) => apiClient.post<{ token: string }>(`/api/orders/${id}/share`),
}
