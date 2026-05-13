import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Phone, Search } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { useClients, useCreateClient } from '../hooks/useClients'
import { formatMoney } from '../utils/formatters'

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: clients = [], isLoading } = useClients()
  const createClient = useCreateClient()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  const handleCreate = async () => {
    if (!form.name.trim()) return
    try {
      await createClient.mutateAsync(form)
      setForm({ name: '', phone: '', notes: '' })
      setModalOpen(false)
      showToast('Клиент добавлен', 'success')
    } catch {
      showToast('Ошибка создания клиента', 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Header
        title="Клиенты"
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Добавить
          </Button>
        }
      />

      <div className="px-4 pt-3 pb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Поиск по имени или телефону"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Клиентов нет"
            description="Добавьте первого клиента"
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Добавить клиента
              </Button>
            }
          />
        ) : (
          filtered.map((client) => (
            <Card key={client.id} onClick={() => navigate(`/clients/${client.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-sm text-gray-500 mt-0.5"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {client.phone}
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-500">
                    {client.orders_count || 0} заказ{(client.orders_count || 0) === 1 ? '' : 'ов'}
                  </p>
                  {(client.total_amount || 0) > 0 && (
                    <p className="text-sm font-medium text-gray-900">
                      {formatMoney(client.total_amount || 0)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Новый клиент">
        <div className="space-y-4">
          <Input
            label="Имя *"
            placeholder="Иван Иванов"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Телефон"
            type="tel"
            placeholder="+7 900 000-00-00"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Заметки"
            placeholder="Любая доп. информация"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Button fullWidth loading={createClient.isPending} onClick={handleCreate}>
            Создать
          </Button>
        </div>
      </Modal>
    </div>
  )
}
