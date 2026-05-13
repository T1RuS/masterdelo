import apiClient from './client'
import type { Photo } from '../types'

export const photosApi = {
  upload: (orderId: string, file: File, stage: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('stage', stage)
    return apiClient.post<Photo>(`/api/orders/${orderId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete: (orderId: string, photoId: string) =>
    apiClient.delete(`/api/orders/${orderId}/photos/${photoId}`),
}
