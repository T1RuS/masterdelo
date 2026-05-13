import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/orders'
import type { OrderStatus, OrderCreateData, OrderUpdateData } from '../types'

export const useOrders = (params?: { status?: OrderStatus; search?: string; client_id?: string }) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.list(params).then((r) => r.data),
  })

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id).then((r) => r.data),
    enabled: !!id,
  })

export const useCreateOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderCreateData) => ordersApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useUpdateOrder = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderUpdateData) => ordersApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useDeleteOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ordersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}
