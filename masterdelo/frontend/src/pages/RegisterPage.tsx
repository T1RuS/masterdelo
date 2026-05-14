import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { AuthLayout } from '../components/layout/AuthLayout'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const schema = z.object({
  full_name: z.string().min(2, 'Введите имя'),
  email:     z.string().email('Неверный формат email'),
  password:  z.string().min(8, 'Пароль не менее 8 символов'),
})

type FormData = z.infer<typeof schema>

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.register(data)
      setToken(res.data.access_token)
      const meRes = await authApi.getMe()
      setUser(meRes.data)
      navigate('/')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err.response?.data?.detail || 'Ошибка регистрации')
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Создать аккаунт</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Бесплатно, без кредитной карты</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Ваше имя"
            type="text"
            placeholder="Иван Иванов"
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="mail@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            Зарегистрироваться
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
