import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { LogOut } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { useNavigate } from 'react-router-dom'

interface FormData {
  full_name: string
  phone: string
  company_name: string
  inn: string
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>()

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        phone: user.phone || '',
        company_name: user.company_name || '',
        inn: user.inn || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.updateMe(data)
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
    <div className="max-w-lg mx-auto">
      <Header title="Профиль" />

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Личные данные</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Имя" placeholder="Иван Иванов" {...register('full_name')} />
            <Input label="Телефон" type="tel" placeholder="+7 900 000-00-00" {...register('phone')} />
            <Input label="Название компании / ИП" placeholder="ИП Иванов И.И." {...register('company_name')} />
            <Input label="ИНН" placeholder="123456789012" {...register('inn')} />

            <Button type="submit" fullWidth loading={isSubmitting}>
              Сохранить профиль
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </div>
  )
}
