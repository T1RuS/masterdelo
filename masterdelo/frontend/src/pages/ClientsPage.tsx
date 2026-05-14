import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Phone, Search, Users } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
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
    <div>
      <Header
        title="Клиенты"
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Добавить
          </Button>
        }
      />

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-3 pb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
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
          <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">
            {filtered.map((client) => (
              <button
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150 active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{client.name}</p>
                    {client.phone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">{client.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {client.orders_count || 0} заказ{(client.orders_count || 0) === 1 ? '' : 'ов'}
                    </p>
                    {(client.total_amount || 0) > 0 && (
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                        {formatMoney(client.total_amount || 0)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
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
