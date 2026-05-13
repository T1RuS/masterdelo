import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical } from 'lucide-react'

interface HeaderProps {
  title: string
  showBack?: boolean
  actions?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, actions }) => {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{title}</h1>
      {actions}
    </header>
  )
}
