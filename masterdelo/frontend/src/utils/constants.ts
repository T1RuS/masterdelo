import type { OrderStatus } from '../types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  done: 'Готово',
  paid: 'Оплачено',
  cancelled: 'Отменён',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
}

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['in_progress', 'cancelled'],
  in_progress: ['done', 'cancelled'],
  done: ['paid', 'in_progress', 'cancelled'],
  paid: [],
  cancelled: [],
}

export const PHOTO_STAGE_LABELS = {
  before: 'До',
  process: 'В процессе',
  after: 'После',
}
