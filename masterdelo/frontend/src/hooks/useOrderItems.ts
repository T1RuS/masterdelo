import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderItemsApi } from '../api/orderItems'
import { photosApi } from '../api/photos'

export const useCreateOrderItem = (orderId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; quantity?: number; unit?: string; cost?: number }) =>
      orderItemsApi.create(orderId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', orderId] }),
  })
}

export const useDeleteOrderItem = (orderId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => orderItemsApi.delete(orderId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', orderId] }),
  })
}

export const useUploadPhoto = (orderId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, stage }: { file: File; stage: string }) =>
      photosApi.upload(orderId, file, stage).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', orderId] }),
  })
}
