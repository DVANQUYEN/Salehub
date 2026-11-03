import { Outlet, Navigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../common/Loading'
import LanguageSwitcher from '../common/LanguageSwitcher'

export default function AuthLayout() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()

  if (loading) return <Loading fullScreen />
  if (user) return <Navigate to="/" />

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-50 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
              <TrendingUp className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-primary-600">SalesHub</h1>
            <p className="mt-2 text-sm text-gray-500">{t('app.tagline')}</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
