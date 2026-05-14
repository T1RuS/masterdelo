import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  accent?: 'indigo' | 'green' | 'amber' | 'red' | 'slate'
}

const accentBar: Record<string, string> = {
  indigo: 'border-l-4 border-l-indigo-500',
  green:  'border-l-4 border-l-green-500',
  amber:  'border-l-4 border-l-amber-500',
  red:    'border-l-4 border-l-red-500',
  slate:  'border-l-4 border-l-slate-400',
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, accent }) => (
  <div
    className={`
      bg-white dark:bg-slate-800
      rounded-2xl shadow-sm
      border border-slate-200 dark:border-slate-700
      p-4
      ${accent ? accentBar[accent] : ''}
      ${onClick ? 'cursor-pointer active:scale-[0.98] hover:shadow-md transition-all duration-150' : ''}
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
)
