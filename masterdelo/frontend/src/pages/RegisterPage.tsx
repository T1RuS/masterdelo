import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const schema = z.object({
  full_name: z.string().min(2, 'Введите имя'),
  email: z.string().email('Неверный формат email'),
  password: z.string().min(8, 'Пароль не менее 8 символов'),
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">МастерДело</h1>
          <p className="text-gray-500 mt-2">Создать аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Регистрация</h2>

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
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={isSubmitting} size="lg">
              Зарегистрироваться
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
