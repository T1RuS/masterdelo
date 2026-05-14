import React, { useState } from 'react'
import { startOfWeek, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import { TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { PageSpinner } from '../components/ui/Spinner'
import { OrderStatusBadge } from '../components/ui/Badge'
import { useOrders } from '../hooks/useOrders'
import { formatMoney, formatDateShort } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'

type Period = 'week' | 'month' | 'all'

const PERIODS = [
  { key: 'week',  label: 'Эта неделя' },
  { key: 'month', label: 'Этот месяц' },
  { key: 'all',   label: 'Всё время' },
]

export const FinancePage: React.FC = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('month')
  const { data: allOrders = [], isLoading } = useOrders()

  const filterByPeriod = (orders: typeof allOrders) => {
    if (period === 'all') return orders
    const now = new Date()
    const start = period === 'week' ? startOfWeek(now, { locale: ru }) : startOfMonth(now)
    return orders.filter((o) => new Date(o.created_at) >= start)
  }

  const periodOrders = filterByPeriod(allOrders)

  const earned = periodOrders
    .filter((o) => o.status === 'paid')
    .reduce((s, o) => s + o.price, 0)

  const inWork = periodOrders
    .filter((o) => ['in_progress', 'done'].includes(o.status))
    .reduce((s, o) => s + o.price, 0)

  const debts = allOrders.filter(
    (o) => ['done', 'paid'].includes(o.status) && o.price - o.prepayment > 0
  )

  return (
    <div>
      <Header title="Финансы" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 space-y-4">
        {/* Period selector */}
        <div className="flex gap-2">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key as Period)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${period === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Заработал</p>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatMoney(earned)}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">В работе</p>
                </div>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(inWork)}</p>
              </div>
            </div>

            {/* Debts */}
            {debts.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <h2 className="font-semibold text-red-700 dark:text-red-400">Долги клиентов</h2>
                </div>
                <div className="space-y-2">
                  {debts.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{o.title}</p>
                        {o.client && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{o.client.name}</p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-red-600 dark:text-red-400 shrink-0">
                        {formatMoney(o.price - o.prepayment)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders list */}
            {periodOrders.length > 0 ? (
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Заказы за период</h2>
                <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
                  {periodOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{o.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <OrderStatusBadge status={o.status} />
                          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateShort(o.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatMoney(o.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Нет заказов за выбранный период</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
