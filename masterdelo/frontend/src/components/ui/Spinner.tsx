import React from 'react'

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent ${className}`}
  />
)

export const PageSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Spinner />
  </div>
)
