import React from 'react'
import { Header } from './Header'

interface PageLayoutProps {
  title: string
  showBack?: boolean
  actions?: React.ReactNode
  children: React.ReactNode
  noPadding?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const MAX_WIDTH_CLS = {
  sm:   'max-w-lg',
  md:   'max-w-2xl',
  lg:   'max-w-4xl',
  xl:   'max-w-6xl',
  full: '',
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  showBack,
  actions,
  children,
  noPadding = false,
  maxWidth = 'full',
}) => (
  <div>
    <Header title={title} showBack={showBack} actions={actions} />
    <div className={noPadding ? '' : `px-4 md:px-6 py-4 ${MAX_WIDTH_CLS[maxWidth]} ${maxWidth !== 'full' ? 'mx-auto' : ''}`}>
      {children}
    </div>
  </div>
)
