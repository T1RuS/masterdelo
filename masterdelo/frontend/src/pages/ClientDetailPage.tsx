import React from 'react'
import { useParams } from 'react-router-dom'
import { Phone, MessageCircle } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { OrderList } from '../components/orders/OrderList'
import { useClient } from '../hooks/useClients'
import { useOrders } from '../hooks/useOrders'
import { formatMoney, whatsappLink } from '../utils/formatters'

export const ClientDetailPage: React.FC = () => {
  const { id = '' } = useParams()
  const { data: client, isLoading } = useClient(id)
  const { data: allOrders = [] } = useOrders({ client_id: id })

  if (isLoading) return <PageSpinner />
  if (!client) return <div className="p-4 text-center text-gray-500">Клиент не найден</div>

  return (
    <div className="max-w-2xl mx-auto">
      <Header title={client.name} showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Client info */}
        <Card>
          <p className="text-xl font-bold text-gray-900 mb-3">{client.name}</p>
          {client.phone && (
            <div className="flex items-center gap-3">
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-2 text-blue-600"
              >
                <Phone className="h-5 w-5" />
                <span className="font-medium">{client.phone}</span>
              </a>
              <a
                href={whatsappLink(client.phone)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-green-600"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          )}
          {client.notes && (
            <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
              {client.notes}
            </p>
          )}
        </Card>

        {/* Stats */}
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Заказов</p>
              <p className="text-2xl font-bold text-gray-900">{client.orders_count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">На сумму</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(client.total_amount || 0)}</p>
            </div>
          </div>
        </Card>

        {/* Orders */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">История заказов</h2>
          <OrderList
            orders={allOrders}
            emptyTitle="Заказов нет"
            emptyDescription="У этого клиента ещё нет заказов"
          />
        </div>
      </div>
    </div>
  )
}
