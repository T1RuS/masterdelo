import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi } from '../api/clients'

export const useClients = () =>
  useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list().then((r) => r.data),
  })

export const useClient = (id: string) =>
  useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.get(id).then((r) => r.data),
    enabled: !!id,
  })

export const useCreateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; phone?: string; notes?: string }) =>
      clientsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export const useUpdateClient = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; phone?: string; notes?: string }) =>
      clientsApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', id] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}
