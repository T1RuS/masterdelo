import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LogOut, Moon, Sun, Send, Users } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { authApi } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { TaxComparisonTable } from '../components/profile/TaxComparisonTable'

interface FormData {
  full_name: string
  phone: string
  company_name: string
  inn: string
  telegram: string
  vk: string
  max_messenger: string
  tax_rate: string
  tax_regime: string
}

type TaxMode = 'none' | 'npd4' | 'npd6' | 'usn6' | 'usn15' | 'psn' | 'osno' | 'custom'

const TAX_OPTIONS: { key: TaxMode; label: string; sub: string; regime: string; rate: string | null }[] = [
  { key: 'none',  label: 'Без налогов', sub: '0% · не считать налог',      regime: '',      rate: '0'  },
  { key: 'npd4',  label: 'НПД · 4%',   sub: 'самозанятый · физлица',       regime: 'npd',   rate: '4'  },
  { key: 'npd6',  label: 'НПД · 6%',   sub: 'самозанятый · ИП и юрлица',   regime: 'npd',   rate: '6'  },
  { key: 'usn6',  label: 'УСН · 6%',   sub: 'упрощёнка · доходы',          regime: 'usn6',  rate: '6'  },
  { key: 'usn15', label: 'УСН · 15%',  sub: 'доходы минус расходы',        regime: 'usn15', rate: '15' },
  { key: 'psn',   label: 'Патент',      sub: 'фиксированный взнос',         regime: 'psn',   rate: '0'  },
  { key: 'osno',  label: 'ОСНО',        sub: 'указать % вручную',           regime: 'osno',  rate: null },
  { key: 'custom', label: 'Своя ставка', sub: 'указать % вручную',          regime: '',      rate: null },
]

const TAX_DETAILS: Record<TaxMode, { title: string; items: string[] }> = {
  none: {
    title: 'Без налогов',
    items: [
      'Налог не рассчитывается и не отображается в разделе «Финансы»',
      'Подходит, если налоги учитываете отдельно или не ведёте официальную деятельность',
    ],
  },
  npd4: {
    title: 'Самозанятый (НПД) · 4% — физлица',
    items: [
      'Федеральный закон №422-ФЗ. Ставка 4% при работе с физическими лицами',
      'Лимит выручки: 2,4 млн ₽ в год',
      'Нет обязательных страховых взносов',
      'Учёт и уплата через приложение «Мой налог» — декларации нет',
      'Нельзя нанимать сотрудников по трудовому договору',
    ],
  },
  npd6: {
    title: 'Самозанятый (НПД) · 6% — ИП и юрлица',
    items: [
      'Ставка 6% применяется, если клиент — ИП или юридическое лицо',
      'Лимит выручки: 2,4 млн ₽ в год (общий с 4%)',
      'Нет обязательных страховых взносов',
      'Чеки клиентам через «Мой налог» обязательны',
    ],
  },
  usn6: {
    title: 'УСН «Доходы» · 6%',
    items: [
      'Налог 6% от всей выручки (регионы могут снизить до 1%)',
      'Лимит: 450 млн ₽ в год, до 130 сотрудников',
      'Страховые взносы: ~57 390 ₽/год (ИП), их можно вычесть из налога',
      'Ежеквартальные авансы + годовая декларация',
    ],
  },
  usn15: {
    title: 'УСН «Доходы минус расходы» · 15%',
    items: [
      'Налог 15% от прибыли: доходы − подтверждённые расходы',
      'Выгоднее УСН 6%, если расходы превышают 60% выручки',
      'Минимальный налог: 1% от дохода, даже при убытке',
      'Нужно документально подтверждать все расходы',
      'Те же лимиты и взносы, что у УСН 6%',
    ],
  },
  psn: {
    title: 'Патент (ПСН) — фиксированный платёж',
    items: [
      'Стоимость патента рассчитывается по потенциальному доходу для вашего вида деятельности',
      'Не зависит от реальной выручки — платите фиксированную сумму за выбранный срок (1–12 мес.)',
      'Сумму устанавливает региональный закон — уточните на nalog.gov.ru',
      'Лимит выручки: 60 млн ₽ в год, до 15 сотрудников',
      'Нет декларации. Страховые взносы: ~57 390 ₽/год',
      'В «Финансах» % не считается — учитывайте стоимость патента вручную',
    ],
  },
  osno: {
    title: 'ОСНО — общая система',
    items: [
      'ИП: НДФЛ 13–22% от прибыли + НДС 20% (или 10% для ряда товаров)',
      'Нет ограничений по выручке и числу сотрудников',
      'Сложная отчётность — рекомендуется бухгалтер',
      'Укажите вашу фактическую ставку вручную ниже',
      'Подходит для работы с крупными компаниями (НДС к вычету)',
    ],
  },
  custom: {
    title: 'Своя ставка',
    items: [
      'Введите вашу реальную ставку вручную — она будет использоваться в «Финансах»',
      'Режим налогообложения не изменится в счетах и актах',
    ],
  },
}

function toMode(rate: number, regime: string | null | undefined): TaxMode {
  if (regime === 'npd')   return rate === 6 ? 'npd6' : 'npd4'
  if (regime === 'usn6')  return 'usn6'
  if (regime === 'usn15') return 'usn15'
  if (regime === 'psn')   return 'psn'
  if (regime === 'osno')  return 'osno'
  if (rate === 0)         return 'none'
  if (rate === 4)         return 'npd4'
  if (rate === 6)         return 'npd6'
  return 'custom'
}

const card = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const { showToast } = useToast()
  const { dark, toggle } = useThemeStore()

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<FormData>()
  const [taxMode, setTaxMode] = useState<TaxMode>('npd4')
  const [hoveredMode, setHoveredMode] = useState<TaxMode | null>(null)

  useEffect(() => {
    if (user) {
      const rate = user.tax_rate ?? 4
      setTaxMode(toMode(rate, user.tax_regime))
      reset({
        full_name:     user.full_name || '',
        phone:         user.phone || '',
        company_name:  user.company_name || '',
        inn:           user.inn || '',
        telegram:      user.telegram || '',
        vk:            user.vk || '',
        max_messenger: user.max_messenger || '',
        tax_rate:      String(rate),
        tax_regime:    user.tax_regime || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.updateMe({
        ...data,
        tax_rate: parseFloat(data.tax_rate) || 0,
        tax_regime: (data.tax_regime as 'npd' | 'usn6' | 'usn15' | 'psn' | 'osno' | null) || null,
      })
      setUser(res.data)
      showToast('Профиль сохранён', 'success')
    } catch {
      showToast('Ошибка сохранения', 'error')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <Header title="Профиль" />

      <div className="px-4 md:px-6 py-4 max-w-5xl mx-auto">
        <div className="md:grid md:grid-cols-[1fr_320px] md:gap-6 space-y-4 md:space-y-0">

          {/* LEFT — main form */}
          <div className="space-y-4">
            {/* Personal data */}
            <div className={`${card} p-6 space-y-4`}>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Личные данные</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="profile-form">
                <Input label="Имя / ФИО" placeholder="Иван Иванов" {...register('full_name')} />
                <Input label="Телефон" type="tel" placeholder="+7 900 000-00-00" {...register('phone')} />
                <Input label="Название компании / ИП" placeholder="ИП Иванов И.И." {...register('company_name')} />
                <Input label="ИНН" placeholder="123456789012" {...register('inn')} />
              </form>
            </div>

            {/* Messengers */}
            <div className={`${card} p-6 space-y-4`}>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Мессенджеры</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Заполните, чтобы клиенты могли написать вам при просмотре заказа
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                    <Send className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <Input
                    label="Telegram"
                    placeholder="@username или username"
                    {...register('telegram')}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Input
                    label="VK"
                    placeholder="id или короткое имя"
                    {...register('vk')}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">М</span>
                  </div>
                  <Input
                    label="MAX"
                    placeholder="username в MAX мессенджере"
                    {...register('max_messenger')}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Unified tax block */}
            <div className={`${card} p-6 space-y-4`}>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Налоговый режим</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Выберите режим — ставка для расчёта в «Финансах» подставится автоматически
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TAX_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onMouseEnter={() => setHoveredMode(opt.key)}
                    onMouseLeave={() => setHoveredMode(null)}
                    onClick={() => {
                      setTaxMode(opt.key)
                      if (opt.rate !== null) setValue('tax_rate', opt.rate)
                      setValue('tax_regime', opt.regime)
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      taxMode === opt.key
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-500'
                        : hoveredMode === opt.key
                          ? 'border-slate-300 dark:border-slate-500 bg-slate-50 dark:bg-slate-700/40'
                          : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${taxMode === opt.key ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>

              {/* Details pane — shows hovered option info, falls back to selected */}
              {(() => {
                const info = TAX_DETAILS[hoveredMode ?? taxMode]
                const isPreview = hoveredMode !== null && hoveredMode !== taxMode
                return (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-600 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{info.title}</p>
                      {isPreview && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">нажмите чтобы выбрать</span>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {info.items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          <span className="shrink-0 text-indigo-400 mt-0.5">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })()}

              {(taxMode === 'custom' || taxMode === 'osno') ? (
                <Input
                  label="Ставка (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="например 13"
                  {...register('tax_rate')}
                />
              ) : (
                <input type="hidden" {...register('tax_rate')} />
              )}
              <input type="hidden" {...register('tax_regime')} />
              <details>
                <summary className="cursor-pointer text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 select-none list-none">
                  ▸ Сравнить режимы таблицей
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <TaxComparisonTable selectedId={TAX_OPTIONS.find(o => o.key === taxMode)?.regime || null} />
                </div>
              </details>
            </div>

            <Button type="submit" form="profile-form" fullWidth loading={isSubmitting}>
              Сохранить профиль
            </Button>
          </div>

          {/* RIGHT — settings */}
          <div className="space-y-4">
            {/* Theme */}
            <div className={`${card} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {dark ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {dark ? 'Тёмная тема' : 'Светлая тема'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Переключить оформление</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${dark ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Account info */}
            <div className={`${card} p-4`}>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Email аккаунта</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.email}</p>
              {user?.is_admin && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                  Администратор
                </span>
              )}
            </div>

            {/* Logout */}
            <div className={`${card} p-4`}>
              <Button variant="danger" fullWidth onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </div>

            {/* Admin link */}
            {user?.is_admin && (
              <div className={`${card} p-4`}>
                <Button variant="secondary" fullWidth onClick={() => navigate('/admin')}>
                  Панель администратора
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
