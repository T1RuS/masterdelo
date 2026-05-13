import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Button } from '../components/ui/Button'
import { OrderList } from '../components/orders/OrderList'
import { PageSpinner } from '../components/ui/Spinner'
import { useOrders } from '../hooks/useOrders'
import { useAuthStore } from '../store/authStore'
import type { OrderStatus } from '../types'

const TABS: { label: string; status?: OrderStatus }[] = [
  { label: 'Все' },
  { label: 'Новые', status: 'new' },
  { label: 'В работе', status: 'in_progress' },
  { label: 'Готово', status: 'done' },
  { label: 'Оплачено', status: 'paid' },
]

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState(0)

  const { data: orders, isLoading } = useOrders(
    TABS[activeTab].status ? { status: TABS[activeTab].status } : undefined
  )

  const today = format(new Date(), 'd MMMM', { locale: ru })
  const name = user?.full_name?.split(' ')[0] || 'мастер'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-gray-500 text-sm">{today}</p>
        <h1 className="text-2xl font-bold text-gray-900">Привет, {name} 👋</h1>
      </div>

      {/* New order button */}
      <div className="px-4 mb-4">
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/orders/new')}
          className="rounded-2xl shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Новый заказ
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-none pb-1">
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeTab === i
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="px-4">
        {isLoading ? (
          <PageSpinner />
        ) : (
          <OrderList
            orders={orders || []}
            emptyTitle="Заказов нет"
            emptyDescription="Нажмите «Новый заказ», чтобы добавить первый"
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
  )
}
