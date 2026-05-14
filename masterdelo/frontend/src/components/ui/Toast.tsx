import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export const useToast = () => useContext(ToastContext)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error:   <XCircle className="h-5 w-5 text-red-500" />,
    info:    <Info className="h-5 w-5 text-indigo-500" />,
  }

  const bg = {
    success: 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800',
    error:   'bg-white dark:bg-slate-800 border-red-200 dark:border-red-800',
    info:    'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-3 rounded-xl border shadow-xl ${bg[t.type]} animate-slide-down`}
          >
            {icons[t.type]}
            <p className="text-sm text-slate-800 dark:text-slate-100 flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="shrink-0">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
