import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, BarChart2, Package, TrendingUp, ShieldCheck, ShieldOff,
  ChevronDown, ChevronUp, Save, X, ExternalLink,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { PageSpinner } from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/ui/Toast'
import apiClient from '../api/client'
import { formatMoney } from '../utils/formatters'
import { ORDER_STATUS_LABELS } from '../utils/constants'
import type { OrderStatus } from '../types'

interface AdminStats {
  total_users: number
  total_orders: number
  total_revenue: number
  active_orders: number
}

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company_name: string | null
  is_admin: boolean
  created_at: string
  orders_count: number
  total_revenue: number
}

interface AdminOrder {
  id: string
  title: string
  status: string
  price: number
  prepayment: number
  created_at: string
  client_name: string | null
}

const STATUS_COLORS: Record<string, string> = {
  new:         'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  in_progress: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  done:        'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  paid:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  cancelled:   'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color,
}) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
  </div>
)

const inputCls = `w-full h-10 px-3 rounded-lg border text-sm
  bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
  border-slate-200 dark:border-slate-600
  focus:outline-none focus:ring-2 focus:ring-indigo-500`

const UserRow: React.FC<{ u: AdminUser; isSelf: boolean }> = ({ u, isSelf }) => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: u.full_name || '',
    phone: u.phone || '',
    company_name: u.company_name || '',
    inn: '',
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery<AdminOrder[]>({
    queryKey: ['admin-user-orders', u.id],
    queryFn: () => apiClient.get<AdminOrder[]>(`/api/admin/users/${u.id}/orders`).then((r) => r.data),
    enabled: expanded,
  })

  const saveUser = useMutation({
    mutationFn: () => apiClient.patch(`/api/admin/users/${u.id}`, editForm).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setEditing(false)
      showToast('Профиль обновлён', 'success')
    },
    onError: () => showToast('Ошибка сохранения', 'error'),
  })

  const changeOrderStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      apiClient.patch(`/api/admin/orders/${orderId}`, { status }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user-orders', u.id] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      showToast('Статус обновлён', 'success')
    },
    onError: () => showToast('Ошибка', 'error'),
  })

  const toggleAdmin = useMutation({
    mutationFn: () => apiClient.patch(`/api/admin/users/${u.id}/toggle-admin`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      showToast('Права обновлены', 'success')
    },
    onError: () => showToast('Ошибка', 'error'),
  })

  return (
    <div className="border-b border-slate-100 dark:border-slate-700 last:border-0">
      {/* User row header */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
          <span className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">
            {(u.full_name || u.email)[0].toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {u.full_name || u.email}
            </p>
            {u.is_admin && (
              <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full shrink-0">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {u.orders_count} зак.
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">{formatMoney(u.total_revenue)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isSelf && (
            <button
              onClick={() => toggleAdmin.mutate()}
              title={u.is_admin ? 'Снять права' : 'Дать права admin'}
              className={`p-1.5 rounded-lg transition-colors ${u.is_admin ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              {u.is_admin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={() => { setExpanded(!expanded); setEditing(false) }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Edit user form */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Данные пользователя</h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Редактировать
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => saveUser.mutate()}
                    disabled={saveUser.isPending}
                    className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium hover:underline"
                  >
                    <Save className="h-3 w-3" /> Сохранить
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium hover:underline"
                  >
                    <X className="h-3 w-3" /> Отмена
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Имя</label>
                  <input
                    className={inputCls}
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Телефон</label>
                  <input
                    className={inputCls}
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Компания</label>
                  <input
                    className={inputCls}
                    value={editForm.company_name}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Имя: </span>
                  <span className="text-slate-700 dark:text-slate-300">{u.full_name || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Тел: </span>
                  <span className="text-slate-700 dark:text-slate-300">{u.phone || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Компания: </span>
                  <span className="text-slate-700 dark:text-slate-300">{u.company_name || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Orders list */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Заказы — {u.orders_count}
              </h3>
            </div>
            {ordersLoading ? (
              <div className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">Загрузка...</div>
            ) : orders.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">Нет заказов</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                {orders.map((o) => (
                  <div key={o.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{o.title}</p>
                      {o.client_name && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{o.client_name}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[o.status] || ''}`}>
                      {ORDER_STATUS_LABELS[o.status as OrderStatus] || o.status}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                      {formatMoney(o.price)}
                    </p>
                    {/* Status change */}
                    <select
                      value={o.status}
                      onChange={(e) => changeOrderStatus.mutate({ orderId: o.id, status: e.target.value })}
                      className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0"
                    >
                      {['new', 'in_progress', 'done', 'paid', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s as OrderStatus]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => navigate(`/orders/${o.id}`)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title="Открыть заказ"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <ShieldOff className="h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Доступ запрещён</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Эта страница только для администраторов</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
          На главную
        </button>
      </div>
    )
  }

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get<AdminStats>('/api/admin/stats').then((r) => r.data),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<AdminUser[]>('/api/admin/users').then((r) => r.data),
  })

  if (statsLoading || usersLoading) return (
    <div><Header title="Администратор" showBack /><PageSpinner /></div>
  )

  return (
    <div>
      <Header title="Администратор" showBack />

      <div className="px-4 md:px-6 py-4 max-w-5xl mx-auto space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Пользователей" value={stats.total_users}
              icon={<Users className="h-5 w-5 text-indigo-600" />} color="bg-indigo-50 dark:bg-indigo-900/30" />
            <StatCard label="Всего заказов" value={stats.total_orders}
              icon={<Package className="h-5 w-5 text-amber-600" />} color="bg-amber-50 dark:bg-amber-900/30" />
            <StatCard label="Активных" value={stats.active_orders}
              icon={<BarChart2 className="h-5 w-5 text-blue-600" />} color="bg-blue-50 dark:bg-blue-900/30" />
            <StatCard label="Оплачено (всего)" value={formatMoney(stats.total_revenue)}
              icon={<TrendingUp className="h-5 w-5 text-green-600" />} color="bg-green-50 dark:bg-green-900/30" />
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Пользователи — {users.length}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Нажмите на стрелку ▼ чтобы посмотреть и редактировать заказы
            </p>
          </div>
          <div>
            {users.map((u) => (
              <UserRow key={u.id} u={u} isSelf={u.id === user.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
