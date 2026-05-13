import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Users, BarChart2, Settings } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Заказы', exact: true },
  { to: '/clients', icon: Users, label: 'Клиенты', exact: false },
  { to: '/finance', icon: BarChart2, label: 'Финансы', exact: false },
  { to: '/profile', icon: Settings, label: 'Профиль', exact: false },
]

export const MobileNav: React.FC = () => (
  <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center md:hidden z-40">
    {links.map(({ to, icon: Icon, label, exact }) => (
      <NavLink
        key={to}
        to={to}
        end={exact}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors
          ${isActive ? 'text-blue-600' : 'text-gray-400'}`
        }
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium">{label}</span>
      </NavLink>
    ))}
  </nav>
)
