import type { OrderStatus } from '../types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new:         'Новый',
  in_progress: 'В работе',
  done:        'Готово',
  paid:        'Оплачено',
  cancelled:   'Отменён',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new:         'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  in_progress: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  done:        'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  paid:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  cancelled:   'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
}

export const ORDER_STATUS_CARD_ACCENT: Record<OrderStatus, 'indigo' | 'green' | 'amber' | 'red' | 'slate'> = {
  new:         'slate',
  in_progress: 'indigo',
  done:        'green',
  paid:        'green',
  cancelled:   'red',
}

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new:         ['in_progress', 'cancelled'],
  in_progress: ['done', 'cancelled'],
  done:        ['paid', 'cancelled'],
  paid:        [],
  cancelled:   [],
}

export const PHOTO_STAGE_LABELS = {
  before:  'До',
  process: 'В процессе',
  after:   'После',
}

export const STATUS_CAL_COLORS: Record<OrderStatus, string> = {
  new:         'bg-slate-500',
  in_progress: 'bg-indigo-500',
  done:        'bg-green-500',
  paid:        'bg-emerald-600',
  cancelled:   'bg-red-400',
}

export const STATUS_CAL_COLORS_BG: Record<OrderStatus, string> = {
  new:         'bg-slate-500/70',
  in_progress: 'bg-indigo-500/70',
  done:        'bg-green-500/70',
  paid:        'bg-emerald-600/70',
  cancelled:   'bg-red-400/70',
}
