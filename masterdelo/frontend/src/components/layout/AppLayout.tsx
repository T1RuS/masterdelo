import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, Users, BarChart2, Settings } from 'lucide-react'
import { MobileNav } from './MobileNav'

const sideLinks = [
  { to: '/', icon: Home, label: 'Заказы', exact: true },
  { to: '/clients', icon: Users, label: 'Клиенты', exact: false },
  { to: '/finance', icon: BarChart2, label: 'Финансы', exact: false },
  { to: '/profile', icon: Settings, label: 'Профиль', exact: false },
]

export const AppLayout: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Desktop sidebar */}
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 flex-col py-6 z-40">
      <div className="px-5 mb-8">
        <span className="text-xl font-bold text-blue-600">МастерДело</span>
      </div>
      <nav className="flex-1 px-3">
        {sideLinks.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors
              ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>

    {/* Main content */}
    <main className="md:ml-56 pb-20 md:pb-0 min-h-screen">
      <Outlet />
    </main>

    {/* Mobile bottom nav */}
    <MobileNav />
  </div>
)
