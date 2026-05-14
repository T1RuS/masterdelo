import React, { useEffect } from 'react'
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

interface FormData {
  full_name: string
  phone: string
  company_name: string
  inn: string
  telegram: string
  vk: string
  max_messenger: string
  tax_rate: string
}

const card = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const { showToast } = useToast()
  const { dark, toggle } = useThemeStore()

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<FormData>()

  useEffect(() => {
    if (user) {
      reset({
        full_name:     user.full_name || '',
        phone:         user.phone || '',
        company_name:  user.company_name || '',
        inn:           user.inn || '',
        telegram:      user.telegram || '',
        vk:            user.vk || '',
        max_messenger: user.max_messenger || '',
        tax_rate:      String(user.tax_rate ?? 4),
      })
    }
  }, [user, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.updateMe({
        ...data,
        tax_rate: parseFloat(data.tax_rate) || 4,
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

            {/* Tax rate */}
            <div className={`${card} p-6 space-y-3`}>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Налоговая ставка</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Для самозанятых: 4% от физлиц, 6% от ИП и организаций. Используется для расчёта НПД.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  label="Ставка НПД (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="4"
                  {...register('tax_rate')}
                  className="w-40"
                />
                <div className="flex gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => setValue('tax_rate', '4')}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    4% (физлица)
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('tax_rate', '6')}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    6% (ИП/орг)
                  </button>
                </div>
              </div>
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
