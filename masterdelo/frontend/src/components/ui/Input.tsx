import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full h-12 px-4 rounded-xl border text-base transition-colors
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]
          [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]
          dark:[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1e293b_inset]
          dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#f1f5f9]
          ${error
            ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
            : 'border-slate-200 dark:border-slate-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-xl border text-base transition-colors resize-none
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${error
            ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
            : 'border-slate-200 dark:border-slate-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
)

Textarea.displayName = 'Textarea'
