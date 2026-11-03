import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bell, ChevronDown, ChevronRight, LogOut, Menu as MenuIcon, User } from 'lucide-react'
import Avatar from '../common/Avatar'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { enumLabel } from '../../i18n/labels'

const SEGMENT_KEYS = {
  products: 'nav.products',
  customers: 'nav.customers',
  deals: 'nav.deals',
  quotes: 'nav.quotes',
  files: 'nav.files',
  admin: 'nav.admin',
  users: 'nav.users',
  profile: 'nav.profile',
  new: 'common.new',
  edit: 'common.edit',
}

function useBreadcrumbs() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const segments = pathname.split('/').filter(Boolean)
  return [
    { label: t('nav.dashboard'), to: '/' },
    ...segments.map((segment, i) => ({
      label: SEGMENT_KEYS[segment] ? t(SEGMENT_KEYS[segment]) : t('common.details'),
      to: `/${segments.slice(0, i + 1).join('/')}`,
    })),
  ]
}

const menuItemClass = ({ focus }) =>
  `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${
    focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
  }`

const logoutItemClass = ({ focus }) =>
  `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none ${
    focus ? 'bg-red-50 text-red-600' : 'text-gray-700'
  }`

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const crumbs = useBreadcrumbs()
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t('nav.openMenu')}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav aria-label={t('nav.breadcrumb')} className="min-w-0">
          <ol className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-sm">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1
              return (
                <li
                  key={crumb.to}
                  className={`min-w-0 items-center gap-2 ${isLast ? 'flex' : 'hidden md:flex'}`}
                >
                  {i > 0 && (
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-gray-400 ${isLast ? 'hidden md:block' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                  {isLast ? (
                    <span aria-current="page" className="truncate font-semibold text-gray-900">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link to={crumb.to} className="truncate text-gray-500 transition-colors hover:text-gray-900">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label={t('nav.notifications')}
          className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        <LanguageSwitcher />

        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            <Avatar name={user?.fullName} />
            <span className="sr-only sm:not-sr-only max-w-[10rem] truncate text-sm font-medium text-gray-900">
              {user?.fullName}
            </span>
            <span className="hidden md:block text-xs text-gray-500">
              {enumLabel(t, 'users.roles', user?.role)}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" aria-hidden="true" />
          </MenuButton>

          <MenuItems
            anchor="bottom end"
            className="z-50 mt-2 w-60 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 transition duration-150 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <div className="mb-1 border-b border-gray-100 px-3 py-2.5">
              <p className="truncate text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <MenuItem as={Link} to="/profile" className={menuItemClass}>
              <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
              {t('nav.profile')}
            </MenuItem>
            <MenuItem as="button" type="button" onClick={logout} className={logoutItemClass}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('nav.logout')}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  )
}
