import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, MoreVertical, Trash2, Edit, Plus, X, Download, Loader2 } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { OrderStatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { BottomSheet } from '../components/ui/BottomSheet'
import { PageSpinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { useOrder, useUpdateOrderStatus, useDeleteOrder } from '../hooks/useOrders'
import { useCreateOrderItem, useDeleteOrderItem } from '../hooks/useOrderItems'
import { formatMoney, formatDate, formatDeadline, whatsappLink } from '../utils/formatters'
import { ORDER_STATUS_LABELS, ALLOWED_TRANSITIONS, PHOTO_STAGE_LABELS } from '../utils/constants'
import { photosApi } from '../api/photos'
import { pdfApi } from '../api/pdf'
import { useQueryClient } from '@tanstack/react-query'
import type { OrderStatus, Photo } from '../types'

type PhotoStage = 'before' | 'process' | 'after'

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

  const [statusSheet, setStatusSheet] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [photoStage, setPhotoStage] = useState<PhotoStage>('process')
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null)
  const [itemForm, setItemForm] = useState({ name: '', quantity: '1', unit: '', cost: '' })
  const [pdfLoading, setPdfLoading] = useState<'invoice' | 'act' | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStatusChange = async (status: OrderStatus) => {
    setStatusSheet(false)
    try {
      await updateStatus.mutateAsync({ id, status })
      showToast('Статус обновлён', 'success')
    } catch {
      showToast('Ошибка обновления статуса', 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить заказ?')) return
    setMenuOpen(false)
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
        showToast('Фото загружено', 'success')
      } catch {
        showToast('Ошибка загрузки фото', 'error')
      }
    }
    qc.invalidateQueries({ queryKey: ['order', id] })
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

  if (isLoading) return <PageSpinner />
  if (!order) return (
    <div className="p-4 text-center text-slate-500 dark:text-slate-400">Заказ не найден</div>
  )

  const deadline = formatDeadline(order.deadline)
  const allowedStatuses = ALLOWED_TRANSITIONS[order.status]
  const photosByStage = (stage: PhotoStage) => order.photos.filter((p) => p.stage === stage)

  const inputCls = `w-full h-12 px-4 rounded-xl border text-base transition-colors
    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    border-slate-200 dark:border-slate-600
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`

  return (
    <div className="max-w-2xl mx-auto">
      <Header
        title={order.title}
        showBack
        actions={
          <div className="relative">
            <button
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 w-44">
                <button
                  className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-800 dark:text-slate-200"
                  onClick={() => { setMenuOpen(false); navigate(`/orders/${id}/edit`) }}
                >
                  <Edit className="h-4 w-4" /> Редактировать
                </button>
                <button
                  className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 text-sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" /> Удалить
                </button>
              </div>
            )}
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-28">
        {/* Status */}
        <div className="flex items-center gap-3">
          <button onClick={() => allowedStatuses.length > 0 && setStatusSheet(true)}>
            <OrderStatusBadge status={order.status} className="text-sm px-3 py-1" />
          </button>
          {allowedStatuses.length > 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">Нажмите для смены</span>
          )}
        </div>

        {/* Client */}
        {order.client && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Клиент</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{order.client.name}</p>
              </div>
              {order.client.phone && (
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
              )}
            </div>
          </Card>
        )}

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

        {/* Dates */}
        {(order.start_date || order.deadline) && (
          <div className="flex items-center gap-4">
            {order.start_date && (
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mb-0.5">Начало</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {formatDate(order.start_date)}
                </span>
              </div>
            )}
            {order.start_date && order.deadline && (
              <div className="text-slate-300 dark:text-slate-600">→</div>
            )}
            {order.deadline && (
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mb-0.5">Срок</span>
                <span className={`text-sm font-medium ${deadline.color}`}>{deadline.label}</span>
              </div>
            )}
          </div>
        )}

        {/* Address */}
        {order.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-sm text-slate-700 dark:text-slate-300">{order.address}</span>
              <a
                href={`https://maps.yandex.ru/?text=${encodeURIComponent(order.address)}`}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-indigo-600 dark:text-indigo-400 mt-0.5"
              >
                Открыть в Яндекс.Картах
              </a>
            </div>
          </div>
        )}

        {/* Description */}
        {order.description && (
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Описание</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{order.description}</p>
          </div>
        )}

        {/* Materials */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Смета материалов</h2>
            <button
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium"
              onClick={() => setAddItemOpen(true)}
            >
              <Plus className="h-4 w-4" /> Добавить
            </button>
          </div>

          {order.items.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-2">Материалы не добавлены</p>
          ) : (
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 py-2 border-b border-slate-50 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.quantity} {item.unit || 'шт'} × {formatMoney(item.cost)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                    {formatMoney(item.quantity * item.cost)}
                  </p>
                  <button
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500"
                    onClick={() => deleteItem.mutate(item.id)}
                  >
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
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Фото</h2>

          <div className="flex gap-2 mb-3">
            {(['before', 'process', 'after'] as PhotoStage[]).map((s) => (
              <button
                key={s}
                onClick={() => setPhotoStage(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${photoStage === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                {PHOTO_STAGE_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {photosByStage(photoStage).map((photo) => (
              <button
                key={photo.id}
                className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
                onClick={() => setViewPhoto(photo)}
              >
                <img src={photo.file_path} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить фото
          </Button>
        </div>
      </div>

      {/* PDF buttons */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-100 dark:border-slate-800 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            size="md"
            loading={pdfLoading === 'invoice'}
            onClick={() => handleDownloadPdf('invoice')}
          >
            {pdfLoading === 'invoice' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Счёт (PDF)
          </Button>
          <Button
            variant="secondary"
            fullWidth
            size="md"
            loading={pdfLoading === 'act'}
            onClick={() => handleDownloadPdf('act')}
          >
            {pdfLoading === 'act' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Акт (PDF)
          </Button>
        </div>
      </div>

      {/* Status bottom sheet */}
      <BottomSheet open={statusSheet} onClose={() => setStatusSheet(false)} title="Сменить статус">
        <div className="space-y-2">
          {allowedStatuses.map((s) => (
            <button
              key={s}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-800 dark:text-slate-200"
              onClick={() => handleStatusChange(s)}
            >
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Add material bottom sheet */}
      <BottomSheet open={addItemOpen} onClose={() => setAddItemOpen(false)} title="Добавить материал">
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder="Название *"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              className={`flex-1 ${inputCls}`}
              placeholder="Кол-во"
              type="number"
              inputMode="decimal"
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
            />
            <input
              className={`w-24 ${inputCls}`}
              placeholder="Ед."
              value={itemForm.unit}
              onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
            />
          </div>
          <input
            className={inputCls}
            placeholder="Цена (за ед.)"
            type="number"
            inputMode="decimal"
            value={itemForm.cost}
            onChange={(e) => setItemForm({ ...itemForm, cost: e.target.value })}
          />
          <Button fullWidth loading={createItem.isPending} onClick={handleAddItem}>
            Добавить
          </Button>
        </div>
      </BottomSheet>

      {/* Photo viewer */}
      {viewPhoto && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setViewPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
            onClick={() => setViewPhoto(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <button
            className="absolute bottom-8 right-4 flex items-center gap-2 px-4 py-2 bg-red-600/90 rounded-xl text-white text-sm"
            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(viewPhoto.id) }}
          >
            <Trash2 className="h-4 w-4" /> Удалить
          </button>
          <img
            src={viewPhoto.file_path}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
