import React from 'react'
import { OrderCard } from './OrderCard'
import { EmptyState } from '../ui/EmptyState'
import type { Order } from '../../types'

interface Props {
  orders: Order[]
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  listClassName?: string
}

export const OrderList: React.FC<Props> = ({
  orders,
  emptyTitle = 'Заказов нет',
  emptyDescription = 'Добавьте первый заказ, чтобы начать работу',
  emptyAction,
  listClassName,
}) => {
  if (orders.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  }

  return (
    <div className={listClassName ?? 'space-y-3'}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
