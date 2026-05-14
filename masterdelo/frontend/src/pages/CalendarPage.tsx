import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isToday, parseISO, isSameDay,
  addMonths, subMonths,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { Header } from '../components/layout/Header'
import { useOrders } from '../hooks/useOrders'
import { STATUS_CAL_COLORS, STATUS_CAL_COLORS_BG, ORDER_STATUS_LABELS } from '../utils/constants'
import type { Order, OrderStatus } from '../types'

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function buildCalendarWeeks(month: Date): Date[][] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end   = endOfWeek(endOfMonth(month),     { weekStartsOn: 1 })
  const weeks: Date[][] = []
  let day = start
  while (day <= end) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1) }
    weeks.push(week)
  }
  return weeks
}

function getOrdersForDay(orders: Order[], day: Date): Order[] {
  return orders.filter((o) => {
    if (o.deadline && isSameDay(parseISO(o.deadline), day)) return true
    if (o.start_date && !o.deadline && isSameDay(parseISO(o.start_date), day)) return true
    return false
  })
}

function getSpanningOrders(orders: Order[], day: Date): Order[] {
  return orders.filter((o) => {
    if (!o.start_date || !o.deadline) return false
    const s = parseISO(o.start_date)
    const e = parseISO(o.deadline)
    return day >= s && day <= e && !isSameDay(s, e)
  })
}

function isRangeStart(order: Order, day: Date): boolean {
  return !!(order.start_date && isSameDay(parseISO(order.start_date), day))
}

function isRangeEnd(order: Order, day: Date): boolean {
  return !!(order.deadline && isSameDay(parseISO(order.deadline), day))
}

const Legend: React.FC = () => (
  <div className="flex flex-wrap gap-3 mt-4 pb-2">
    {(Object.entries(STATUS_CAL_COLORS) as [OrderStatus, string][]).map(([status, color]) => (
      <div key={status} className="flex items-center gap-1.5">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-xs text-slate-500 dark:text-slate-400">{ORDER_STATUS_LABELS[status]}</span>
      </div>
    ))}
  </div>
)

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate()
  const [month, setMonth] = useState(new Date())

  const { data: orders = [] } = useOrders()
  const weeks = useMemo(() => buildCalendarWeeks(month), [month])

  const goToday = () => setMonth(new Date())

  const handleDayClick = (day: Date) => {
    navigate(`/orders/new?date=${format(day, 'yyyy-MM-dd')}`)
  }

  const monthOrders = useMemo(() => {
    const start = startOfMonth(month)
    const end   = endOfMonth(month)
    return orders.filter((o) => {
      const d = o.deadline ? parseISO(o.deadline) : null
      return d && d >= start && d <= end
    }).sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0
      return a.deadline.localeCompare(b.deadline)
    })
  }, [orders, month])

  const MonthOrdersList = () => (
    <>
      {monthOrders.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
          Нет заказов с дедлайном в этом месяце
        </p>
      ) : (
        <div className="space-y-2">
          {monthOrders.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all text-left"
            >
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_CAL_COLORS[o.status as OrderStatus]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{o.title}</p>
                {o.client && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">{o.client.name}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {o.deadline ? format(parseISO(o.deadline), 'd MMM', { locale: ru }) : ''}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div>
      <Header
        title="Календарь"
        actions={
          <button
            onClick={() => navigate('/orders/new')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="md:flex">
        {/* LEFT — Calendar grid */}
        <div className="flex-1 min-w-0 px-4 md:px-6 pt-4 pb-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMonth(subMonths(month, 1))}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
                {format(month, 'LLLL yyyy', { locale: ru })}
              </h2>
              <button
                onClick={goToday}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Сегодня
              </button>
            </div>

            <button
              onClick={() => setMonth(addMonths(month, 1))}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs font-semibold py-1.5
                  ${i >= 5 ? 'text-red-400 dark:text-red-500' : 'text-slate-400 dark:text-slate-500'}`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((day, di) => {
                  const dayOrders    = getOrdersForDay(orders, day)
                  const spanOrders   = getSpanningOrders(orders, day)
                  const inMonth      = isSameMonth(day, month)
                  const todayDay     = isToday(day)
                  const isWeekend    = di >= 5

                  const allDayItems = [
                    ...spanOrders.map((o) => ({ o, isSpan: true })),
                    ...dayOrders.filter((o) => !spanOrders.find((s) => s.id === o.id)).map((o) => ({ o, isSpan: false })),
                  ].slice(0, 3)

                  return (
                    <button
                      key={di}
                      onClick={() => handleDayClick(day)}
                      className={`
                        min-h-[64px] md:min-h-[76px] p-1 rounded-xl text-left transition-all duration-100 relative overflow-hidden
                        ${!inMonth ? 'opacity-20 pointer-events-none' : ''}
                        ${todayDay
                          ? 'bg-indigo-600 ring-2 ring-indigo-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                      `}
                    >
                      <span className={`
                        text-xs font-bold block text-center leading-tight mb-0.5
                        ${todayDay ? 'text-white' : isWeekend ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}
                      `}>
                        {format(day, 'd')}
                      </span>

                      <div className="space-y-0.5">
                        {allDayItems.map(({ o, isSpan }) => {
                          const color = STATUS_CAL_COLORS[o.status as OrderStatus]
                          const bgColor = STATUS_CAL_COLORS_BG[o.status as OrderStatus]
                          if (isSpan) {
                            const rStart = isRangeStart(o, day)
                            const rEnd   = isRangeEnd(o, day)
                            return (
                              <div
                                key={o.id}
                                onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`) }}
                                title={o.title}
                                className={`h-[10px] relative cursor-pointer
                                  ${rStart ? 'rounded-l-full ml-0' : '-ml-1'}
                                  ${rEnd ? 'rounded-r-full mr-0' : '-mr-1'}
                                  ${todayDay ? 'bg-white/30' : bgColor}
                                `}
                              >
                                {rStart && (
                                  <span className={`absolute left-1 top-0 text-[8px] leading-[10px] font-bold truncate text-white px-0.5 ${color} rounded-sm`}>
                                    {o.title.slice(0, 6)}
                                  </span>
                                )}
                              </div>
                            )
                          }
                          return (
                            <div
                              key={o.id}
                              onClick={(e) => { e.stopPropagation(); navigate(`/orders/${o.id}`) }}
                              className={`px-1 py-px rounded text-[9px] leading-tight font-semibold truncate ${color} text-white`}
                              title={o.title}
                            >
                              {o.title}
                            </div>
                          )
                        })}
                        {(dayOrders.length + spanOrders.length) > 3 && (
                          <div className={`text-[8px] font-medium text-center ${todayDay ? 'text-indigo-200' : 'text-slate-400'}`}>
                            +{dayOrders.length + spanOrders.length - 3}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend (desktop) */}
          <div className="hidden md:block">
            <Legend />
          </div>

          {/* Mobile: month orders list + legend */}
          <div className="md:hidden mt-6 pb-4">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Сроки в этом месяце — {monthOrders.length} заказов
            </h3>
            <MonthOrdersList />
            <Legend />
          </div>
        </div>

        {/* RIGHT — desktop sidebar: month orders */}
        <div className="hidden md:flex flex-col w-80 shrink-0 border-l border-slate-200 dark:border-slate-800">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Сроки — {monthOrders.length} заказов
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <MonthOrdersList />
          </div>
        </div>
      </div>
    </div>
  )
}
