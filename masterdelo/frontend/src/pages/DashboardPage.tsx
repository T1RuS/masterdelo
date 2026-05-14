import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, Clock, Wallet, CalendarDays, ArrowRight } from 'lucide-react'
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Button } from '../components/ui/Button'
import { OrderList } from '../components/orders/OrderList'
import { PageSpinner } from '../components/ui/Spinner'
import { useOrders } from '../hooks/useOrders'
import { useAuthStore } from '../store/authStore'
import { formatMoney, formatDeadline } from '../utils/formatters'
import type { OrderStatus } from '../types'

const TABS: { label: string; status?: OrderStatus }[] = [
  { label: 'Все' },
  { label: 'Новые',    status: 'new' },
  { label: 'В работе', status: 'in_progress' },
  { label: 'Готово',   status: 'done' },
  { label: 'Оплачено', status: 'paid' },
]

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState(0)

  const { data: allOrders = [] } = useOrders()
  const { data: filteredOrders, isLoading } = useOrders(
    TABS[activeTab].status ? { status: TABS[activeTab].status } : undefined
  )

  const today = format(new Date(), 'd MMMM', { locale: ru })
  const name = user?.full_name?.split(' ')[0] || 'мастер'

  const activeCount    = allOrders.filter((o) => o.status === 'in_progress').length
  const totalRevenue   = allOrders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.price, 0)
  const pendingBalance = allOrders
    .filter((o) => !['paid', 'cancelled'].includes(o.status))
    .reduce((s, o) => s + (o.price - o.prepayment), 0)

  const upcoming = allOrders
    .filter((o) => {
      if (!o.deadline || ['paid', 'cancelled'].includes(o.status)) return false
      const d = parseISO(o.deadline)
      const now = new Date()
      return isAfter(d, now) && isBefore(d, addDays(now, 8))
    })
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    .slice(0, 6)

  return (
    <div className="flex flex-col md:flex-row md:min-h-screen">
      {/* LEFT — main scrollable content */}
      <div className="flex-1 min-w-0">
        {/* Hero gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 md:px-8 pt-6 pb-10">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }}
          />
          <p className="text-indigo-200 text-sm mb-1">{today}</p>
          <h1 className="text-2xl font-bold text-white mb-5">Здравствуйте, {name}!</h1>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-indigo-200" />
                <span className="text-xs text-indigo-200">В работе</span>
              </div>
              <p className="text-xl font-bold text-white">{activeCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-200" />
                <span className="text-xs text-indigo-200">Оплачено</span>
              </div>
              <p className="text-lg font-bold text-white leading-tight">{formatMoney(totalRevenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="h-3.5 w-3.5 text-indigo-200" />
                <span className="text-xs text-indigo-200">К получению</span>
              </div>
              <p className="text-lg font-bold text-amber-300 leading-tight">{formatMoney(pendingBalance)}</p>
            </div>
          </div>
        </div>

        {/* New order button (mobile) */}
        <div className="px-4 -mt-5 mb-4 relative z-10 md:hidden">
          <Button fullWidth size="lg" onClick={() => navigate('/orders/new')} className="shadow-lg shadow-indigo-500/30">
            <Plus className="h-5 w-5 mr-2" />
            Новый заказ
          </Button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 px-4 md:px-6 mb-4 md:mt-5 overflow-x-auto scrollbar-none pb-1">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${activeTab === i
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="px-4 md:px-6 pb-6">
          {isLoading ? (
            <PageSpinner />
          ) : (
            <OrderList
              orders={filteredOrders || []}
              emptyTitle="Заказов нет"
              emptyDescription="Нажмите «Новый заказ», чтобы добавить первый"
              listClassName="space-y-3 md:space-y-0 md:grid md:gap-3 md:grid-cols-2"
              emptyAction={
                <Button onClick={() => navigate('/orders/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить заказ
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* RIGHT — desktop sidebar panel */}
      <div className="hidden md:flex flex-col w-72 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* New order button */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <Button fullWidth onClick={() => navigate('/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Новый заказ
          </Button>
        </div>

        {/* Upcoming deadlines */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Ближайшие сроки</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Следующие 7 дней</p>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <CalendarDays className="h-9 w-9 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Нет срочных заказов</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming.map((o) => {
              const dl = formatDeadline(o.deadline)
              return (
                <button
                  key={o.id}
                  onClick={() => navigate(`/orders/${o.id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{o.title}</p>
                  {o.client && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{o.client.name}</p>}
                  <p className={`text-xs font-semibold mt-1 ${dl.color}`}>{dl.label}</p>
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={() => navigate('/calendar')}
          className="flex items-center justify-between px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-t border-slate-100 dark:border-slate-800"
        >
          <span>Открыть календарь</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Summary stats */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Всего заказов</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{allOrders.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Выручка</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{formatMoney(totalRevenue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">К получению</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{formatMoney(pendingBalance)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
