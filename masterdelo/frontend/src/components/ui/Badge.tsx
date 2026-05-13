import React from 'react'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../utils/constants'
import type { OrderStatus } from '../../types'

interface BadgeProps {
  status: OrderStatus
  className?: string
}

export const OrderStatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[status]} ${className}`}
  >
    {ORDER_STATUS_LABELS[status]}
  </span>
)

interface SimpleBadgeProps {
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<SimpleBadgeProps> = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ${className}`}
  >
    {children}
  </span>
)
