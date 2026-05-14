import React from 'react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="mb-4 text-slate-300 dark:text-slate-600">
      {icon || <PackageOpen className="h-16 w-16" />}
    </div>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">{description}</p>
    )}
    {action}
  </div>
)
