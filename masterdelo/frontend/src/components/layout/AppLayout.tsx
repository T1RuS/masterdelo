import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, Users, BarChart2, Settings, CalendarDays, Sun, Moon } from 'lucide-react'
import { MobileNav } from './MobileNav'
import { useThemeStore } from '../../store/themeStore'

const sideLinks = [
  { to: '/',         icon: Home,          label: 'Заказы',    exact: true  },
  { to: '/calendar', icon: CalendarDays,  label: 'Календарь', exact: false },
  { to: '/clients',  icon: Users,         label: 'Клиенты',   exact: false },
  { to: '/finance',  icon: BarChart2,     label: 'Финансы',   exact: false },
  { to: '/profile',  icon: Settings,      label: 'Профиль',   exact: false },
]

export const AppLayout: React.FC = () => {
  const { dark, toggle } = useThemeStore()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar — always dark */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 bg-slate-900 flex-col py-6 z-40">
        {/* Logo */}
        <NavLink to="/" end className="px-5 mb-8 flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">МД</span>
          </div>
          <span className="text-white text-lg font-bold tracking-tight group-hover:text-indigo-200 transition-colors">МастерДело</span>
        </NavLink>

        <nav className="flex-1 px-3 space-y-0.5">
          {sideLinks.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 mt-2 mb-3">
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            {dark ? <Moon className="h-5 w-5 shrink-0" /> : <Sun className="h-5 w-5 shrink-0" />}
            {dark ? 'Тёмная тема' : 'Светлая тема'}
          </button>
        </div>

        <div className="px-5">
          <p className="text-xs text-slate-600">МастерДело v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-56 pb-20 md:pb-6 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
