import { useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import { enumLabel } from '../../i18n/labels'
import {
  LayoutDashboard, Package, Users, Target, FileText,
  Upload, UserCog, TrendingUp, X
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/products', icon: Package, labelKey: 'nav.products' },
  { path: '/customers', icon: Users, labelKey: 'nav.customers' },
  { path: '/deals', icon: Target, labelKey: 'nav.deals' },
  { path: '/quotes', icon: FileText, labelKey: 'nav.quotes' },
  { path: '/files', icon: Upload, labelKey: 'nav.files' },
]

const adminItems = [
  { path: '/admin/users', icon: UserCog, labelKey: 'nav.users' },
]

function NavItem({ item, onNavigate }) {
  const { t } = useTranslation()
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary-600" />
          )}
          <Icon
            className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}
            aria-hidden="true"
          />
          <span>{t(item.labelKey)}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open = false, onClose }) {
  const { user } = useAuth()
  const { t } = useTranslation()

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={() => onClose?.()}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-[transform,visibility] duration-300 ease-in-out lg:translate-x-0 lg:visible ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <Link
            to="/"
            onClick={() => onClose?.()}
            className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900">SalesHub</span>
          </Link>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label={t('nav.closeMenu')}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label={t('nav.mainNavigation')} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map(item => (
            <NavItem key={item.path} item={item} onNavigate={onClose} />
          ))}

          {user?.role === 'ADMIN' && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{t('nav.admin')}</p>
              <div className="space-y-1">
                {adminItems.map(item => (
                  <NavItem key={item.path} item={item} onNavigate={onClose} />
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <Link
            to="/profile"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Avatar name={user?.fullName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{user?.fullName || t('common.user')}</p>
              <p className="truncate text-xs text-gray-500">{enumLabel(t, 'users.roles', user?.role)}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
