import { NavLink } from 'react-router-dom'
import { Globe, Globe2, TrendingUp, Newspaper, LayoutDashboard, FlaskConical, MapPin } from 'lucide-react'

const links = [
  { to: '/',              label: 'Dashboard', icon: LayoutDashboard, end: true  },
  { to: '/stocks',        label: 'Stocks',    icon: TrendingUp,      end: false },
  { to: '/globe',         label: 'Globe',     icon: Globe2,          end: false },
  { to: '/countries-api', label: 'Countries', icon: MapPin,          end: false },
  { to: '/news',          label: 'News',      icon: Newspaper,       end: false },
  { to: '/sandbox',       label: 'Sandbox',   icon: FlaskConical,    end: false },
]

export function Navbar() {
  return (
    <header className="bg-surface-card/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-8">
        <NavLink to="/" className="flex items-center gap-2 font-extrabold text-xl shrink-0 tracking-tight">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-900 text-brand-300 shadow-glow-sm">
            <Globe size={18} />
          </span>
          <span className="text-gradient-brand">FinGlobe</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-900 text-brand-300 shadow-glow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
