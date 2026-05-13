import { format, formatDistanceToNow, isPast, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatMoney = (n: number | string | null | undefined): string => {
  const val = typeof n === 'string' ? parseFloat(n) : (n ?? 0)
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

export const formatDate = (d: string | null | undefined): string => {
  if (!d) return ''
  return format(new Date(d), 'd MMMM', { locale: ru })
}

export const formatDateShort = (d: string | null | undefined): string => {
  if (!d) return ''
  return format(new Date(d), 'd MMM yyyy', { locale: ru })
}

export const formatDeadline = (d: string | null | undefined): {
  label: string
  color: string
} => {
  if (!d) return { label: '', color: 'text-gray-400' }
  const dt = new Date(d)
  if (isToday(dt)) return { label: 'Сегодня', color: 'text-orange-600' }
  if (isPast(dt)) {
    const dist = formatDistanceToNow(dt, { locale: ru, addSuffix: false })
    return { label: `Просрочен на ${dist}`, color: 'text-red-600' }
  }
  const dist = formatDistanceToNow(dt, { locale: ru, addSuffix: true })
  return { label: `${formatDate(d)} (${dist})`, color: 'text-gray-500' }
}

export const cleanPhone = (phone: string): string =>
  phone.replace(/\D/g, '')

export const whatsappLink = (phone: string): string =>
  `https://wa.me/${cleanPhone(phone)}`
