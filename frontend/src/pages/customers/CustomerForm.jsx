import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { enumLabel } from '../../i18n/labels'
import { getCustomer, createCustomer, updateCustomer } from '../../services/customerService'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { CUSTOMER_STATUSES } from '../../utils/constants'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = Object.keys(CUSTOMER_STATUSES)

export default function CustomerForm() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      status: 'NEW',
    },
  })

  useEffect(() => {
    if (isEdit) {
      loadCustomer()
    }
  }, [id])

  const loadCustomer = async () => {
    try {
      const res = await getCustomer(id)
      reset(res.data.data)
    } catch (error) {
      toast.error(t('messages.customerLoadFailed'))
      navigate('/customers')
    }
  }

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateCustomer(id, data)
        toast.success(t('messages.customerUpdated'))
      } else {
        await createCustomer(data)
        toast.success(t('messages.customerCreated'))
      }
      navigate('/customers')
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.customerSaveFailed'))
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? t('customers.editCustomer') : t('customers.addCustomer')}
          </h1>
          <p className="text-gray-600">
            {isEdit ? t('customers.editSubtitle') : t('customers.newSubtitle')}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('customers.companyName')}
            {...register('companyName', { required: t('validation.required', { field: t('customers.companyName') }) })}
            error={errors.companyName?.message}
          />

          <Input
            label={t('customers.contactName')}
            {...register('contactName')}
            error={errors.contactName?.message}
          />

          <Input
            label={t('common.email')}
            type="email"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('validation.emailInvalid'),
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label={t('common.phone')}
            {...register('phone')}
            error={errors.phone?.message}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('common.address')}
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Select
            label={t('common.status')}
            {...register('status')}
            error={errors.status?.message}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {enumLabel(t, 'statuses', s)}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/customers')}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
