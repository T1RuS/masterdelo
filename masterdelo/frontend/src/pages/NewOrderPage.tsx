import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { useCreateOrder } from '../hooks/useOrders'
import { useClients, useCreateClient } from '../hooks/useClients'
import { useToast } from '../components/ui/Toast'

const schema = z.object({
  title: z.string().min(1, 'Введите описание работ'),
  price: z.coerce.number().min(0, 'Введите сумму'),
  client_id: z.string().optional(),
  prepayment: z.coerce.number().optional(),
  deadline: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export const NewOrderPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [newClientMode, setNewClientMode] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  const { data: clients = [] } = useClients()
  const createOrder = useCreateOrder()
  const createClient = useCreateClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const selectedClientId = watch('client_id')
  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return
    try {
      const client = await createClient.mutateAsync({ name: newClientName, phone: newClientPhone })
      setValue('client_id', client.id)
      setClientSearch(client.name)
      setNewClientMode(false)
      setNewClientName('')
      setNewClientPhone('')
    } catch {
      showToast('Ошибка создания клиента', 'error')
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const order = await createOrder.mutateAsync({
        ...data,
        prepayment: data.prepayment || 0,
        client_id: data.client_id || null,
        deadline: data.deadline || null,
        address: data.address || null,
        description: data.description || null,
      })
      showToast('Заказ создан', 'success')
      navigate(`/orders/${order.id}`)
    } catch {
      showToast('Ошибка создания заказа', 'error')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title="Новый заказ" showBack />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 pb-28 space-y-4">
        {/* Client selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Клиент</label>
          <div className="relative">
            {selectedClient && !showClientDropdown ? (
              <div
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between cursor-pointer"
                onClick={() => { setClientSearch(selectedClient.name); setShowClientDropdown(true) }}
              >
                <span>{selectedClient.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            ) : (
              <input
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Поиск клиента..."
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true) }}
                onFocus={() => setShowClientDropdown(true)}
              />
            )}

            {showClientDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto mt-1">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setValue('client_id', c.id)
                      setClientSearch(c.name)
                      setShowClientDropdown(false)
                    }}
                  >
                    <span className="font-medium">{c.name}</span>
                    {c.phone && <span className="text-sm text-gray-400">{c.phone}</span>}
                  </button>
                ))}
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 text-blue-600 flex items-center gap-2 border-t border-gray-100"
                  onClick={() => { setNewClientMode(true); setShowClientDropdown(false) }}
                >
                  <Plus className="h-4 w-4" /> Новый клиент
                </button>
              </div>
            )}
          </div>

          {newClientMode && (
            <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
              <Input
                placeholder="Имя клиента *"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
              <Input
                placeholder="Телефон"
                type="tel"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handleCreateClient} loading={createClient.isPending}>
                  Добавить
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setNewClientMode(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <Textarea
          label="Что делаем *"
          placeholder="Навес из профтрубы, 6×4 метра"
          rows={3}
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Price */}
        <Input
          label="Сумма *"
          type="number"
          inputMode="numeric"
          placeholder="45000"
          error={errors.price?.message}
          {...register('price')}
        />

        {/* Optional fields */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-2 text-sm text-gray-600 font-medium"
        >
          Дополнительно
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="space-y-4 animate-fade-in">
            <Input
              label="Аванс получен"
              type="number"
              inputMode="numeric"
              placeholder="0"
              {...register('prepayment')}
            />
            <Input
              label="Срок выполнения"
              type="date"
              {...register('deadline')}
            />
            <Input
              label="Адрес объекта"
              type="text"
              placeholder="ул. Ленина 12, кв. 5"
              {...register('address')}
            />
            <Textarea
              label="Заметки"
              placeholder="Любые дополнительные пометки..."
              rows={2}
              {...register('description')}
            />
          </div>
        )}
      </form>

      {/* Fixed bottom button */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-56 bg-white border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto">
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Сохранить заказ
          </Button>
        </div>
      </div>
    </div>
  )
}
