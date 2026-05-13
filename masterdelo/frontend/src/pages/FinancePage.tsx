import React, { useState } from 'react'
import { startOfWeek, startOfMonth, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { OrderStatusBadge } from '../components/ui/Badge'
import { useOrders } from '../hooks/useOrders'
import { formatMoney, formatDateShort } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'

type Period = 'week' | 'month' | 'all'

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

  const metrics = [
    { label: 'Заработал', value: earned, color: 'text-green-600' },
    { label: 'В работе', value: inWork, color: 'text-blue-600' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <Header title="Финансы" />

      <div className="px-4 py-4 space-y-4">
        {/* Period selector */}
        <div className="flex gap-2">
          {[
            { key: 'week', label: 'Эта неделя' },
            { key: 'month', label: 'Этот месяц' },
            { key: 'all', label: 'Всё время' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key as Period)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
                ${period === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
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
              {metrics.map(({ label, value, color }) => (
                <Card key={label}>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{formatMoney(value)}</p>
                </Card>
              ))}
            </div>

            {/* Orders list */}
            {periodOrders.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Заказы за период</h2>
                <div className="space-y-2">
                  {periodOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{o.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <OrderStatusBadge status={o.status} />
                          <span className="text-xs text-gray-400">{formatDateShort(o.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatMoney(o.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debts */}
            {debts.length > 0 && (
              <div>
                <h2 className="font-semibold text-red-600 mb-3">Долги</h2>
                <div className="space-y-2">
                  {debts.map((o) => (
                    <div
                      key={o.id}
                      className="bg-red-50 rounded-xl border border-red-100 px-4 py-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{o.title}</p>
                        {o.client && (
                          <p className="text-xs text-gray-500">{o.client.name}</p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-red-600 shrink-0">
                        {formatMoney(o.price - o.prepayment)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {periodOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>Нет заказов за выбранный период</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
