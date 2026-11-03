import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await login(data.email, data.password)
      toast.success(t('messages.loginSuccess'))
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (email, password) => {
    setValue('email', email, { shouldValidate: true, shouldDirty: true })
    setValue('password', password, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('auth.email')}
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email', {
          required: t('validation.required', { field: t('auth.email') }),
          pattern: { value: /^\S+@\S+$/i, message: t('validation.emailInvalid') }
        })}
      />

      <Input
        label={t('auth.password')}
        type="password"
        placeholder={'\u2022'.repeat(8)}
        error={errors.password?.message}
        {...register('password', {
          required: t('validation.required', { field: t('auth.password') }),
          minLength: { value: 6, message: t('validation.minLength', { count: 6 }) }
        })}
      />

      <Button type="submit" loading={loading} className="w-full">
        {t('auth.login')}
      </Button>

      {/* Demo Login Buttons */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-xs text-gray-500 text-center mb-2">
          {t('auth.demoHint')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin@salehub.com', 'Admin@123')}
            className="flex flex-col items-center px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <span className="text-xs font-semibold text-indigo-700">👑 {t('auth.demoAdmin')}</span>
            <span className="text-[10px] text-indigo-500 mt-0.5">admin@salehub.com</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('pham.duc@salehub.com', 'Sales@123')}
            className="flex flex-col items-center px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <span className="text-xs font-semibold text-blue-700">💼 {t('auth.demoSales')}</span>
            <span className="text-[10px] text-blue-500 mt-0.5">pham.duc@salehub.com</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('a.nguyen@techflow.com', 'Customer@123')}
            className="flex flex-col items-center px-3 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <span className="text-xs font-semibold text-green-700">🏢 {t('auth.demoCustomer')}</span>
            <span className="text-[10px] text-green-500 mt-0.5">a.nguyen@techflow.com</span>
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
          {t('auth.forgotPassword')}
        </Link>
        <p className="text-sm text-gray-500">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </form>
  )
}
