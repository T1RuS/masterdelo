import apiClient from './client'
import type { OrderItem } from '../types'

export const orderItemsApi = {
  list: (orderId: string) =>
    apiClient.get<OrderItem[]>(`/api/orders/${orderId}/items`),

  create: (orderId: string, data: { name: string; quantity?: number; unit?: string; cost?: number }) =>
    apiClient.post<OrderItem>(`/api/orders/${orderId}/items`, data),

  update: (orderId: string, itemId: string, data: Partial<OrderItem>) =>
    apiClient.put<OrderItem>(`/api/orders/${orderId}/items/${itemId}`, data),

  delete: (orderId: string, itemId: string) =>
    apiClient.delete(`/api/orders/${orderId}/items/${itemId}`),
}
