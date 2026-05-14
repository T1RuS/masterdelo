import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Calendar, CheckCircle2, Clock, XCircle, Package } from 'lucide-react'
import apiClient from '../api/client'
import { formatMoney } from '../utils/formatters'
import { ORDER_STATUS_LABELS } from '../utils/constants'
import type { OrderStatus } from '../types'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

interface PublicOrder {
  id: string
  title: string
  status: OrderStatus
  price: number
  prepayment: number
  balance_due: number
  start_date: string | null
  deadline: string | null
  description: string | null
  address: string | null
  client: { name: string } | null
  photos: { file_path: string; stage: 'before' | 'process' | 'after' }[]
  items: { name: string; quantity: number; unit: string | null; cost: number }[]
}

const STAGE_LABELS = { before: 'До работ', process: 'В процессе', after: 'Результат' }

const StatusIcon: Record<OrderStatus, React.ReactNode> = {
  new:         <Clock className="h-5 w-5 text-slate-500" />,
  in_progress: <Clock className="h-5 w-5 text-indigo-500" />,
  done:        <CheckCircle2 className="h-5 w-5 text-green-500" />,
  paid:        <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  cancelled:   <XCircle className="h-5 w-5 text-red-500" />,
}

const StatusColors: Record<OrderStatus, string> = {
  new:         'bg-slate-100 text-slate-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  done:        'bg-green-100 text-green-700',
  paid:        'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-red-100 text-red-700',
}

export const PublicOrderPage: React.FC = () => {
  const { token = '' } = useParams()
  const navigate = useNavigate()

  const { data: order, isLoading, isError } = useQuery<PublicOrder>({
    queryKey: ['public-order', token],
    queryFn: () => apiClient.get<PublicOrder>(`/api/public/order/${token}`).then((r) => r.data),
    enabled: !!token,
    retry: false,
  })

  const photosByStage = (stage: 'before' | 'process' | 'after') =>
    order?.photos.filter((p) => p.stage === stage) || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <XCircle className="h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Ссылка не найдена</h1>
        <p className="text-slate-500 mb-6">Эта ссылка устарела или недействительна</p>
        <button
          onClick={() => navigate('/landing')}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          На главную
        </button>
      </div>
    )
  }

  const hasPhotos = order.photos.length > 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — brand only, no navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">МД</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">МастерДело</span>
        </div>
        <button
          onClick={() => navigate('/landing')}
          className="text-xs text-indigo-600 hover:underline"
        >
          О сервисе
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Title + Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h1 className="text-xl font-bold text-slate-900 mb-3">{order.title}</h1>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${StatusColors[order.status]}`}>
            {StatusIcon[order.status]}
            {ORDER_STATUS_LABELS[order.status]}
          </div>
          {order.client && (
            <p className="text-sm text-slate-500 mt-2">Клиент: {order.client.name}</p>
          )}
        </div>

        {/* Finance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Стоимость</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Договор</p>
              <p className="font-bold text-slate-900">{formatMoney(order.price)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Аванс</p>
              <p className="font-bold text-slate-900">{formatMoney(order.prepayment)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">К оплате</p>
              <p className={`font-bold ${order.balance_due > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {formatMoney(order.balance_due)}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        {(order.start_date || order.deadline) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Сроки</h2>
            </div>
            <div className="flex items-center gap-4">
              {order.start_date && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Начало</p>
                  <p className="text-sm font-medium text-slate-700">
                    {format(parseISO(order.start_date), 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              )}
              {order.start_date && order.deadline && <span className="text-slate-300">→</span>}
              {order.deadline && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Срок</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {format(parseISO(order.deadline), 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {order.address && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700">{order.address}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {order.description && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-2">Описание</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.description}</p>
          </div>
        )}

        {/* Materials */}
        {order.items.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Смета материалов</h2>
            </div>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.quantity} {item.unit || 'шт'} × {formatMoney(item.cost)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatMoney(item.quantity * item.cost)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {hasPhotos && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Фото</h2>
            {(['before', 'process', 'after'] as const).map((stage) => {
              const photos = photosByStage(stage)
              if (photos.length === 0) return null
              return (
                <div key={stage} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{STAGE_LABELS[stage]}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, i) => (
                      <a key={i} href={photo.file_path} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={photo.file_path} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
          Информация предоставлена через МастерДело
        </p>
      </div>
    </div>
  )
}
