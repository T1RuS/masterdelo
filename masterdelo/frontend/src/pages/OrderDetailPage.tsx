import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, MoreVertical, Trash2, Edit, Plus, X, Download } from 'lucide-react'
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
        name: itemForm.name,
        quantity: parseFloat(itemForm.quantity) || 1,
        unit: itemForm.unit || undefined,
        cost: parseFloat(itemForm.cost) || 0,
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

  if (isLoading) return <PageSpinner />
  if (!order) return <div className="p-4 text-center text-gray-500">Заказ не найден</div>

  const deadline = formatDeadline(order.deadline)
  const allowedStatuses = ALLOWED_TRANSITIONS[order.status]
  const photosByStage = (stage: PhotoStage) => order.photos.filter((p) => p.stage === stage)

  return (
    <div className="max-w-2xl mx-auto">
      <Header
        title={order.title}
        showBack
        actions={
          <div className="relative">
            <button
              className="p-2 rounded-xl hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 w-40">
                <button
                  className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 text-sm"
                  onClick={() => { setMenuOpen(false); navigate(`/orders/${id}/edit`) }}
                >
                  <Edit className="h-4 w-4" /> Редактировать
                </button>
                <button
                  className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 text-sm"
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
            <span className="text-xs text-gray-400">Нажмите для смены</span>
          )}
        </div>

        {/* Client */}
        {order.client && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Клиент</p>
                <p className="font-semibold text-gray-900">{order.client.name}</p>
              </div>
              {order.client.phone && (
                <div className="flex gap-2">
                  <a
                    href={`tel:${order.client.phone}`}
                    className="p-2.5 bg-blue-50 rounded-xl text-blue-600"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                  <a
                    href={whatsappLink(order.client.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-green-50 rounded-xl text-green-600"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Finance */}
        <Card>
          <p className="text-xs text-gray-400 mb-3">Финансы</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Договор</p>
              <p className="font-bold text-gray-900">{formatMoney(order.price)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Аванс</p>
              <p className="font-bold text-gray-900">{formatMoney(order.prepayment)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">К получению</p>
              <p className={`font-bold ${order.balance_due > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                {formatMoney(order.balance_due)}
              </p>
            </div>
          </div>
          {order.total_cost > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Материалы: <span className="font-medium">{formatMoney(order.total_cost)}</span>
                {' → '}
                Прибыль: <span className="font-semibold text-green-600">{formatMoney(order.margin)}</span>
              </p>
            </div>
          )}
        </Card>

        {/* Deadline */}
        {order.deadline && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Срок:</span>
            <span className={`text-sm font-medium ${deadline.color}`}>{deadline.label}</span>
          </div>
        )}

        {/* Address */}
        {order.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-sm text-gray-700">{order.address}</span>
              <a
                href={`https://maps.yandex.ru/?text=${encodeURIComponent(order.address)}`}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-blue-600 mt-0.5"
              >
                Открыть в Яндекс.Картах
              </a>
            </div>
          </div>
        )}

        {/* Description */}
        {order.description && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Описание</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.description}</p>
          </div>
        )}

        {/* Materials */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Смета материалов</h2>
            <button
              className="flex items-center gap-1 text-blue-600 text-sm font-medium"
              onClick={() => setAddItemOpen(true)}
            >
              <Plus className="h-4 w-4" /> Добавить
            </button>
          </div>

          {order.items.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Материалы не добавлены</p>
          ) : (
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 py-2 border-b border-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} {item.unit || 'шт'} × {formatMoney(item.cost)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">
                    {formatMoney(item.quantity * item.cost)}
                  </p>
                  <button
                    className="p-1.5 text-gray-300 hover:text-red-500"
                    onClick={() => deleteItem.mutate(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold text-gray-900">
                <span>Итого материалы</span>
                <span>{formatMoney(order.total_cost)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Фото</h2>

          {/* Stage tabs */}
          <div className="flex gap-2 mb-3">
            {(['before', 'process', 'after'] as PhotoStage[]).map((s) => (
              <button
                key={s}
                onClick={() => setPhotoStage(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${photoStage === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {PHOTO_STAGE_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {photosByStage(photoStage).map((photo) => (
              <button
                key={photo.id}
                className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                onClick={() => setViewPhoto(photo)}
              >
                <img
                  src={photo.file_path}
                  alt=""
                  className="w-full h-full object-cover"
                />
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить фото
          </Button>
        </div>
      </div>

      {/* PDF buttons */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-56 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <a
            href={`/api/pdf/invoice/${id}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="secondary" fullWidth size="md">
              <Download className="h-4 w-4 mr-2" />
              Счёт (PDF)
            </Button>
          </a>
          <a
            href={`/api/pdf/act/${id}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="secondary" fullWidth size="md">
              <Download className="h-4 w-4 mr-2" />
              Акт (PDF)
            </Button>
          </a>
        </div>
      </div>

      {/* Status bottom sheet */}
      <BottomSheet open={statusSheet} onClose={() => setStatusSheet(false)} title="Сменить статус">
        <div className="space-y-2">
          {allowedStatuses.map((s) => (
            <button
              key={s}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-gray-800"
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
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Название *"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              className="flex-1 h-12 px-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Кол-во"
              type="number"
              inputMode="decimal"
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
            />
            <input
              className="w-24 h-12 px-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ед."
              value={itemForm.unit}
              onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
            />
          </div>
          <input
            className="w-full h-12 px-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
