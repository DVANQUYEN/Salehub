import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { formatDate } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t('messages.passwordMismatch'))
      return
    }
    try {
      setLoading(true)
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success(t('messages.passwordChanged'))
      reset()
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.passwordChangeFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('profile.title')}</h1>

      <Card title={t('profile.userInfo')}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-500">{t('auth.fullName')}</p>
              <p className="font-medium">{user?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-500">{t('common.email')}</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-500">{t('users.role')}</p>
              <Badge variant={user?.role === 'ADMIN' ? 'danger' : 'info'}>
                {enumLabel(t, 'users.roles', user?.role)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-500">{t('profile.memberSince')}</p>
              <p className="font-medium">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title={t('profile.changePassword')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('profile.currentPassword')}
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword', { required: t('validation.required', { field: t('profile.currentPassword') }) })}
          />
          <Input
            label={t('profile.newPassword')}
            type="password"
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: t('validation.required', { field: t('profile.newPassword') }),
              minLength: { value: 6, message: t('validation.minLength', { count: 6 }) },
            })}
          />
          <Input
            label={t('auth.confirmPassword')}
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', { required: t('validation.required', { field: t('auth.confirmPassword') }) })}
          />
          <Button type="submit" loading={loading}>{t('profile.changePassword')}</Button>
        </form>
      </Card>
    </div>
  )
}
