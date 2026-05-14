import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { OrderStatusBadge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { formatMoney, formatDeadline } from '../../utils/formatters'
import { ORDER_STATUS_CARD_ACCENT } from '../../utils/constants'
import type { Order } from '../../types'

interface Props {
  order: Order
}

export const OrderCard: React.FC<Props> = ({ order }) => {
  const navigate = useNavigate()
  const deadline = formatDeadline(order.deadline)
  const accent = ORDER_STATUS_CARD_ACCENT[order.status]

  return (
    <Card onClick={() => navigate(`/orders/${order.id}`)} accent={accent}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <OrderStatusBadge status={order.status} />
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {formatMoney(order.price)}
        </span>
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-tight">
        {order.title}
      </h3>

      {order.client && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">{order.client.name}</span>
          {order.client.phone && (
            <a
              href={`tel:${order.client.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              {order.client.phone}
            </a>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        {order.prepayment > 0 && (
          <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            Долг: {formatMoney(order.price - order.prepayment)}
          </span>
        )}
        {deadline.label && (
          <span className={`text-xs ml-auto font-medium ${deadline.color}`}>{deadline.label}</span>
        )}
      </div>
    </Card>
  )
}
