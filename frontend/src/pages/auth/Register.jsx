import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

export default function Register() {
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await registerUser(data)
      toast.success(t('messages.registerSuccess'))
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.registerFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('auth.fullName')}
        type="text"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register('fullName', { required: t('validation.required', { field: t('auth.fullName') }) })}
      />

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
        {t('auth.register')}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  )
}
