import React, { useState } from 'react'
import { startOfWeek, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import { TrendingUp, Wallet, AlertCircle, Download, Receipt, Package, ArrowDownRight } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { PageSpinner } from '../components/ui/Spinner'
import { OrderStatusBadge } from '../components/ui/Badge'
import { useOrders } from '../hooks/useOrders'
import { useAuthStore } from '../store/authStore'
import { formatMoney, formatDateShort } from '../utils/formatters'
import { ORDER_STATUS_LABELS } from '../utils/constants'
import type { OrderStatus } from '../types'
import { useNavigate } from 'react-router-dom'

type Period = 'week' | 'month' | 'all'

function exportCSV(orders: { title: string; client?: { name: string } | null; status: string; price: number; prepayment: number; total_cost: number; created_at: string }[], period: string) {
  const headers = ['Название', 'Клиент', 'Статус', 'Выручка (₽)', 'Материалы (₽)', 'Прибыль (₽)', 'Аванс (₽)', 'Дата создания']
  const rows = orders.map((o) => [
    o.title,
    o.client?.name || '',
    ORDER_STATUS_LABELS[o.status as OrderStatus],
    o.price,
    o.total_cost,
    o.price - o.total_cost,
    o.prepayment,
    new Date(o.created_at).toLocaleDateString('ru-RU'),
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `masterdelo_${period}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const PERIODS = [
  { key: 'week',  label: 'Эта неделя' },
  { key: 'month', label: 'Этот месяц' },
  { key: 'all',   label: 'Всё время' },
]

export const FinancePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [period, setPeriod] = useState<Period>('month')
  const { data: allOrders = [], isLoading } = useOrders()

  const taxRate = user?.tax_rate ?? 4

  const filterByPeriod = (orders: typeof allOrders) => {
    if (period === 'all') return orders
    const now = new Date()
    const start = period === 'week' ? startOfWeek(now, { locale: ru }) : startOfMonth(now)
    return orders.filter((o) => new Date(o.created_at) >= start)
  }

  const periodOrders = filterByPeriod(allOrders)
  const paidOrders = periodOrders.filter((o) => o.status === 'paid')

  // Выручка — суммарная цена оплаченных заказов (включает работу + материалы)
  const revenue = paidOrders.reduce((s, o) => s + o.price, 0)

  // Расходы на материалы — из позиций оплаченных заказов
  const materialCost = paidOrders.reduce((s, o) => s + (o.total_cost ?? 0), 0)

  // Прибыль = Выручка − Материалы
  const profit = revenue - materialCost

  // В работе
  const inWork = periodOrders
    .filter((o) => ['in_progress', 'done'].includes(o.status))
    .reduce((s, o) => s + o.price, 0)

  // НПД: по закону (ФЗ №422-ФЗ) начисляется на весь полученный доход (выручку),
  // расходы на материалы не вычитаются
  const taxBase = revenue
  const taxAmount = (taxBase * taxRate) / 100

  const debts = allOrders.filter(
    (o) => o.status === 'done' && o.price - o.prepayment > 0
  )

  return (
    <div>
      <Header
        title="Финансы"
        actions={
          <button
            onClick={() => exportCSV(periodOrders, period)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        }
      />

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
            {/* Revenue metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Выручка (оборот)</p>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatMoney(revenue)}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">получено за оплаченные заказы</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">В работе</p>
                </div>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(inWork)}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">ожидаемая выручка</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-orange-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Материалы</p>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatMoney(materialCost)}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">расходы на материалы</p>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200 dark:border-green-900/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">Прибыль</p>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatMoney(profit)}</p>
                <p className="text-[10px] text-green-600/70 dark:text-green-500/70 mt-1">выручка − материалы</p>
              </div>
            </div>

            {/* НПД tax block */}
            {paidOrders.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h2 className="font-semibold text-amber-800 dark:text-amber-300">
                    Налог НПД — ставка {taxRate}%
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-1">Налоговая база</p>
                    <p className="font-bold text-amber-900 dark:text-amber-200">{formatMoney(taxBase)}</p>
                    <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60 mt-0.5">
                      вся выручка (оборот)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-1">Ставка</p>
                    <p className="font-bold text-amber-900 dark:text-amber-200">{taxRate}%</p>
                    <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60 mt-0.5">
                      из профиля
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-1">К уплате</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{formatMoney(taxAmount)}</p>
                  </div>
                </div>

                <p className="text-[11px] text-amber-600/70 dark:text-amber-400/60">
                  По закону (ФЗ №422-ФЗ) НПД начисляется на всю выручку —{' '}
                  {formatMoney(taxBase)} × {taxRate}% = {formatMoney(taxAmount)}.
                  Расходы на материалы из налоговой базы не вычитаются.
                  Ставку НПД можно изменить в настройках профиля.
                </p>
              </div>
            )}

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
                  {periodOrders.map((o) => {
                    const orderProfit = o.price - (o.total_cost ?? 0)
                    const orderTax = (o.price * taxRate) / 100
                    return (
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
                          {o.status === 'paid' && (
                            <>
                              {(o.total_cost ?? 0) > 0 && (
                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5">
                                  прибыль: {formatMoney(orderProfit)}
                                </p>
                              )}
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                                НПД: {formatMoney(orderTax)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
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
