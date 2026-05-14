import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Phone, MessageCircle, MapPin, Trash2, Edit, Plus, X,
  Download, Loader2, CheckCircle2, Share2, Copy,
} from 'lucide-react'
import { Header } from '../components/layout/Header'
import { OrderStatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { useOrder, useUpdateOrderStatus, useDeleteOrder } from '../hooks/useOrders'
import { useCreateOrderItem, useDeleteOrderItem } from '../hooks/useOrderItems'
import { formatMoney, formatDate, formatDeadline, whatsappLink } from '../utils/formatters'
import { ORDER_STATUS_LABELS, ALLOWED_TRANSITIONS, PHOTO_STAGE_LABELS } from '../utils/constants'
import { photosApi } from '../api/photos'
import { pdfApi } from '../api/pdf'
import { ordersApi } from '../api/orders'
import { useQueryClient } from '@tanstack/react-query'
import type { OrderStatus, Photo } from '../types'

type PhotoStage = 'before' | 'process' | 'after'

const STATUS_FLOW: OrderStatus[] = ['new', 'in_progress', 'done', 'paid']

const STATUS_ACTION_LABELS: Record<OrderStatus, string> = {
  new:         'Принять в работу',
  in_progress: 'Завершить',
  done:        'Помечено оплаченным',
  paid:        'Оплачено',
  cancelled:   'Отменить',
}

const STATUS_NEXT_LABELS: Partial<Record<OrderStatus, string>> = {
  in_progress: '▶ Принять в работу',
  done:        '✓ Завершить работу',
  paid:        '₽ Получил оплату',
  cancelled:   '✕ Отменить заказ',
}

export const OrderDetailPage: React.FC = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qc = useQueryClient()

  const { data: order, isLoading } = useOrder(id)
  const updateStatus = useUpdateOrderStatus()
  const deleteOrder = useDeleteOrder()
  const createItem = useCreateOrderItem(id)
  const deleteItem = useDeleteOrderItem(id)

  const [addItemOpen, setAddItemOpen] = useState(false)
  const [photoStage, setPhotoStage] = useState<PhotoStage>('process')
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null)
  const [itemForm, setItemForm] = useState({ name: '', quantity: '1', unit: '', cost: '' })
  const [pdfLoading, setPdfLoading] = useState<'invoice' | 'act' | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState<OrderStatus | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStatusChange = async (status: OrderStatus) => {
    setStatusLoading(status)
    try {
      await updateStatus.mutateAsync({ id, status })
      showToast(`Статус: ${ORDER_STATUS_LABELS[status]}`, 'success')
    } catch {
      showToast('Ошибка обновления статуса', 'error')
    } finally {
      setStatusLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить заказ? Это действие нельзя отменить.')) return
    try {
      await deleteOrder.mutateAsync(id)
      navigate('/')
    } catch {
      showToast('Ошибка удаления', 'error')
    }
  }

  const handleAddItem = async () => {
    if (!itemForm.name.trim()) return
    try {
      await createItem.mutateAsync({
        name:     itemForm.name,
        quantity: parseFloat(itemForm.quantity) || 1,
        unit:     itemForm.unit || undefined,
        cost:     parseFloat(itemForm.cost) || 0,
      })
      setItemForm({ name: '', quantity: '1', unit: '', cost: '' })
      setAddItemOpen(false)
      showToast('Материал добавлен', 'success')
    } catch {
      showToast('Ошибка добавления', 'error')
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      try {
        await photosApi.upload(id, file, photoStage)
      } catch {
        showToast('Ошибка загрузки фото', 'error')
      }
    }
    qc.invalidateQueries({ queryKey: ['order', id] })
    showToast('Фото загружено', 'success')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await photosApi.delete(id, photoId)
      qc.invalidateQueries({ queryKey: ['order', id] })
      setViewPhoto(null)
      showToast('Фото удалено', 'success')
    } catch {
      showToast('Ошибка удаления фото', 'error')
    }
  }

  const handleDownloadPdf = async (type: 'invoice' | 'act') => {
    setPdfLoading(type)
    try {
      if (type === 'invoice') await pdfApi.downloadInvoice(id)
      else await pdfApi.downloadAct(id)
    } catch {
      showToast('Ошибка генерации PDF', 'error')
    } finally {
      setPdfLoading(null)
    }
  }

  const handleShare = async () => {
    setShareLoading(true)
    try {
      const res = await ordersApi.share(id)
      const url = `${window.location.origin}/share/${res.data.token}`
      await navigator.clipboard.writeText(url)
      showToast('Ссылка скопирована', 'success')
    } catch {
      showToast('Ошибка создания ссылки', 'error')
    } finally {
      setShareLoading(false)
    }
  }

  if (isLoading) return <PageSpinner />
  if (!order) return <div className="p-4 text-center text-slate-500 dark:text-slate-400">Заказ не найден</div>

  const deadline = formatDeadline(order.deadline)
  const allowedStatuses = ALLOWED_TRANSITIONS[order.status]
  const photosByStage = (stage: PhotoStage) => order.photos.filter((p) => p.stage === stage)
  const currentStepIdx = STATUS_FLOW.indexOf(order.status)

  const inputCls = `w-full h-12 px-4 rounded-xl border text-base transition-colors
    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    border-slate-200 dark:border-slate-600
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`

  const MainContent = () => (
    <div className="space-y-4">
      {/* Client */}
      {order.client && (
        <Card>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Клиент</p>
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{order.client.name}</p>
          {order.client.phone && (
            <div className="flex items-center justify-between mt-2">
              <a
                href={`tel:${order.client.phone}`}
                className="text-base font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wide hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {order.client.phone}
              </a>
              <div className="flex gap-2">
                <a href={`tel:${order.client.phone}`}
                  className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Phone className="h-5 w-5" />
                </a>
                <a href={whatsappLink(order.client.phone)} target="_blank" rel="noreferrer"
                  className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Dates + address */}
      {(order.start_date || order.deadline || order.address) && (
        <Card>
          {(order.start_date || order.deadline) && (
            <div className="flex items-center gap-4 mb-3">
              {order.start_date && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Начало</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(order.start_date)}</p>
                </div>
              )}
              {order.start_date && order.deadline && (
                <div className="text-slate-300 dark:text-slate-600 mt-3">→</div>
              )}
              {order.deadline && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Срок</p>
                  <p className={`text-sm font-semibold ${deadline.color}`}>{deadline.label}</p>
                </div>
              )}
            </div>
          )}
          {order.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-sm text-slate-700 dark:text-slate-300">{order.address}</span>
                <a href={`https://maps.yandex.ru/?text=${encodeURIComponent(order.address)}`}
                  target="_blank" rel="noreferrer"
                  className="block text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Открыть в Яндекс.Картах
                </a>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Description */}
      {order.description && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Описание</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{order.description}</p>
        </div>
      )}

      {/* Materials */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Смета материалов</h2>
          <button
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium"
            onClick={() => setAddItemOpen(!addItemOpen)}
          >
            <Plus className="h-4 w-4" /> Добавить
          </button>
        </div>

        {addItemOpen && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
            <input className={inputCls} placeholder="Название *" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
            <div className="flex gap-2">
              <input className={`flex-1 ${inputCls}`} placeholder="Кол-во" type="number" inputMode="decimal" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
              <input className={`w-20 ${inputCls}`} placeholder="Ед." value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} />
            </div>
            <input className={inputCls} placeholder="Цена (за ед.)" type="number" inputMode="decimal" value={itemForm.cost} onChange={(e) => setItemForm({ ...itemForm, cost: e.target.value })} />
            <div className="flex gap-2">
              <Button fullWidth loading={createItem.isPending} onClick={handleAddItem}>Добавить</Button>
              <Button variant="ghost" onClick={() => setAddItemOpen(false)}>Отмена</Button>
            </div>
          </div>
        )}

        {order.items.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-2">Материалы не добавлены</p>
        ) : (
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.quantity} {item.unit || 'шт'} × {formatMoney(item.cost)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 shrink-0">{formatMoney(item.quantity * item.cost)}</p>
                <button className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500" onClick={() => deleteItem.mutate(item.id)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex justify-between py-2 font-semibold text-slate-900 dark:text-slate-100">
              <span>Итого материалы</span>
              <span>{formatMoney(order.total_cost)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Фото</h2>
        <div className="flex gap-2 mb-3">
          {(['before', 'process', 'after'] as PhotoStage[]).map((s) => (
            <button key={s} onClick={() => setPhotoStage(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${photoStage === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {PHOTO_STAGE_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photosByStage(photoStage).map((photo) => (
            <button key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700" onClick={() => setViewPhoto(photo)}>
              <img src={photo.file_path} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handlePhotoUpload} />
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Plus className="h-4 w-4 mr-1" /> Добавить фото
        </Button>
      </div>
    </div>
  )

  const Sidebar = () => (
    <div className="space-y-4">
      {/* Status — explicit pipeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Статус заказа</p>

        {/* Stepper */}
        {order.status !== 'cancelled' && (
          <div className="flex items-center mb-4">
            {STATUS_FLOW.map((s, i) => {
              const isDone = i < currentStepIdx
              const isActive = s === order.status
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors
                      ${isActive ? 'bg-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-800' :
                        isDone ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                    <span className={`text-[9px] mt-1 text-center leading-tight
                      ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' :
                        isDone ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'}`}>
                      {ORDER_STATUS_LABELS[s]}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 -mt-3 transition-colors
                      ${i < currentStepIdx ? 'bg-green-400 dark:bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <X className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Заказ отменён</span>
          </div>
        )}

        {order.status === 'paid' && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Полностью оплачено</span>
          </div>
        )}

        {/* Action buttons */}
        {allowedStatuses.length > 0 && (
          <div className="flex flex-col gap-2">
            {allowedStatuses.filter((s) => s !== 'cancelled').map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={statusLoading !== null}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {statusLoading === s ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {STATUS_NEXT_LABELS[s] || ORDER_STATUS_LABELS[s]}
              </button>
            ))}
            {allowedStatuses.includes('cancelled') && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={statusLoading !== null}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 disabled:opacity-50"
              >
                {STATUS_NEXT_LABELS['cancelled']}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Finance */}
      <Card>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Финансы</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Договор</p>
            <p className="font-bold text-slate-900 dark:text-slate-100">{formatMoney(order.price)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Аванс</p>
            <p className="font-bold text-slate-900 dark:text-slate-100">{formatMoney(order.prepayment)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">К получению</p>
            <p className={`font-bold ${order.balance_due > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {formatMoney(order.balance_due)}
            </p>
          </div>
        </div>
        {order.total_cost > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Материалы: <span className="font-medium text-slate-800 dark:text-slate-200">{formatMoney(order.total_cost)}</span>
              {' → '}
              Прибыль: <span className="font-semibold text-green-600 dark:text-green-400">{formatMoney(order.margin)}</span>
            </p>
          </div>
        )}
      </Card>

      {/* PDF + Share */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="md" loading={pdfLoading === 'invoice'} onClick={() => handleDownloadPdf('invoice')}>
          {pdfLoading === 'invoice' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Счёт PDF
        </Button>
        <Button variant="secondary" size="md" loading={pdfLoading === 'act'} onClick={() => handleDownloadPdf('act')}>
          {pdfLoading === 'act' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Акт PDF
        </Button>
      </div>

      <Button variant="secondary" fullWidth onClick={handleShare} loading={shareLoading}>
        {shareLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
        Поделиться с клиентом
      </Button>
    </div>
  )

  return (
    <div>
      <Header
        title={order.title}
        showBack
        actions={
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              onClick={() => navigate(`/orders/${id}/edit`)}
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 dark:text-slate-500 hover:text-red-500"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Desktop 2-column / Mobile single column */}
      <div className="md:flex md:gap-0">
        {/* Left — main content */}
        <div className="flex-1 min-w-0 px-4 md:px-6 py-4 space-y-4 pb-32 md:pb-6">
          <MainContent />
        </div>

        {/* Right — sidebar (desktop) / below (mobile) */}
        <div className="hidden md:block w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 px-4 py-4 bg-white dark:bg-slate-900">
          <Sidebar />
        </div>

        {/* Mobile: sidebar content below main, before fixed bar */}
        <div className="md:hidden px-4 pb-4 space-y-4">
          <Sidebar />
        </div>
      </div>

      {/* Mobile PDF bar */}
      <div className="fixed bottom-16 left-0 right-0 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-100 dark:border-slate-800 p-3">
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth size="md" loading={pdfLoading === 'invoice'} onClick={() => handleDownloadPdf('invoice')}>
            <Download className="h-4 w-4 mr-1" /> Счёт
          </Button>
          <Button variant="secondary" fullWidth size="md" loading={pdfLoading === 'act'} onClick={() => handleDownloadPdf('act')}>
            <Download className="h-4 w-4 mr-1" /> Акт
          </Button>
          <button
            onClick={handleShare}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Photo viewer */}
      {viewPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setViewPhoto(null)}>
          <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white" onClick={() => setViewPhoto(null)}>
            <X className="h-6 w-6" />
          </button>
          <button
            className="absolute bottom-8 right-4 flex items-center gap-2 px-4 py-2 bg-red-600/90 rounded-xl text-white text-sm"
            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(viewPhoto.id) }}
          >
            <Trash2 className="h-4 w-4" /> Удалить
          </button>
          <img src={viewPhoto.file_path} alt="" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
