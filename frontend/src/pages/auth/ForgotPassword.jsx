import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/authService'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { t } = useTranslation()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await authService.forgotPassword(data)
      setSubmitted(true)
      toast.success(t('messages.resetLinkSent'))
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.resetLinkFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-50 text-green-800 rounded-lg">
          {t('auth.checkEmail')}
        </div>
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    )
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

      <Button type="submit" loading={loading} className="w-full">
        {t('auth.sendResetLink')}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t('auth.rememberPassword')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  )
}
