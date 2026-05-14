import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, Plus } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'
import { useOrder, useUpdateOrder } from '../hooks/useOrders'
import { useClients, useCreateClient } from '../hooks/useClients'
import { useToast } from '../components/ui/Toast'

const schema = z.object({
  title:        z.string().min(1, 'Введите описание работ'),
  price:        z.coerce.number().min(0, 'Введите сумму'),
  client_id:    z.string().optional(),
  prepayment:   z.coerce.number().optional(),
  start_date:   z.string().optional(),
  deadline:     z.string().optional(),
  address:      z.string().optional(),
  description:  z.string().optional(),
})

type FormData = z.infer<typeof schema>

const inputCls = `w-full h-12 px-4 rounded-xl border text-base transition-colors
  bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  border-slate-200 dark:border-slate-600
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`

export const EditOrderPage: React.FC = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: order, isLoading } = useOrder(id)
  const { data: clients = [] } = useClients()
  const updateOrder = useUpdateOrder(id)
  const createClient = useCreateClient()

  const [newClientMode, setNewClientMode] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (order) {
      reset({
        title:       order.title,
        price:       order.price,
        client_id:   order.client_id || undefined,
        prepayment:  order.prepayment,
        start_date:  order.start_date || undefined,
        deadline:    order.deadline || undefined,
        address:     order.address || undefined,
        description: order.description || undefined,
      })
      if (order.client) setClientSearch(order.client.name)
    }
  }, [order, reset])

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
    } catch {
      showToast('Ошибка создания клиента', 'error')
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      await updateOrder.mutateAsync({
        title:       data.title,
        price:       data.price,
        client_id:   data.client_id || null,
        prepayment:  data.prepayment || 0,
        start_date:  data.start_date || null,
        deadline:    data.deadline || null,
        address:     data.address || null,
        description: data.description || null,
      })
      showToast('Заказ сохранён', 'success')
      navigate(`/orders/${id}`)
    } catch {
      showToast('Ошибка сохранения', 'error')
    }
  }

  if (isLoading) return <PageSpinner />

  const ClientSelector = () => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Клиент</label>
      <div className="relative">
        {selectedClient && !showClientDropdown ? (
          <div
            className={`${inputCls} flex items-center justify-between cursor-pointer`}
            onClick={() => { setClientSearch(selectedClient.name); setShowClientDropdown(true) }}
          >
            <span>{selectedClient.name}</span>
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
        ) : (
          <input
            className={inputCls}
            placeholder="Поиск клиента..."
            value={clientSearch}
            onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true) }}
            onFocus={() => setShowClientDropdown(true)}
          />
        )}
        {showClientDropdown && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto mt-1">
            {filteredClients.map((c) => (
              <button key={c.id} type="button"
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                onClick={() => { setValue('client_id', c.id); setClientSearch(c.name); setShowClientDropdown(false) }}
              >
                <span className="font-medium">{c.name}</span>
                {c.phone && <span className="text-sm text-slate-400">{c.phone}</span>}
              </button>
            ))}
            <button type="button"
              className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"
              onClick={() => { setNewClientMode(true); setShowClientDropdown(false) }}
            >
              <Plus className="h-4 w-4" /> Новый клиент
            </button>
            {selectedClientId && (
              <button type="button"
                className="w-full px-4 py-3 text-left text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-t border-slate-100 dark:border-slate-700"
                onClick={() => { setValue('client_id', undefined); setClientSearch(''); setShowClientDropdown(false) }}
              >
                Без клиента
              </button>
            )}
          </div>
        )}
      </div>
      {newClientMode && (
        <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-800 space-y-2">
          <Input placeholder="Имя клиента *" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
          <Input placeholder="Телефон" type="tel" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleCreateClient} loading={createClient.isPending}>Добавить</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setNewClientMode(false)}>Отмена</Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <Header title="Редактировать заказ" showBack />

      <form onSubmit={handleSubmit(onSubmit)} id="edit-order-form">
        <div className="px-4 md:px-6 py-4 max-w-5xl mx-auto">
          <div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">

            {/* LEFT column */}
            <div className="space-y-4">
              <ClientSelector />

              <Textarea
                label="Что делаем *"
                placeholder="Навес из профтрубы, 6×4 метра"
                rows={4}
                error={errors.title?.message}
                {...register('title')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Сумма договора *"
                  type="number"
                  inputMode="numeric"
                  placeholder="45000"
                  error={errors.price?.message}
                  {...register('price')}
                />
                <Input
                  label="Аванс получен"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  {...register('prepayment')}
                />
              </div>
            </div>

            {/* RIGHT column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Начало работ" type="date" {...register('start_date')} />
                <Input label="Срок сдачи"   type="date" {...register('deadline')} />
              </div>
              <Input label="Адрес объекта" type="text" placeholder="ул. Ленина 12, кв. 5" {...register('address')} />
              <Textarea
                label="Заметки / описание"
                placeholder="Любые дополнительные пометки..."
                rows={6}
                {...register('description')}
              />
            </div>
          </div>

          {/* Desktop submit */}
          <div className="hidden md:flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => navigate(`/orders/${id}`)}>Отмена</Button>
            <Button type="submit" size="lg" loading={isSubmitting}>Сохранить</Button>
          </div>
        </div>
      </form>

      {/* Mobile fixed button */}
      <div className="fixed bottom-16 left-0 right-0 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => navigate(`/orders/${id}`)}>Отмена</Button>
          <Button type="submit" fullWidth size="lg" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}
