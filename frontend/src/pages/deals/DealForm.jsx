import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { enumLabel } from '../../i18n/labels'
import { getDeal, createDeal, updateDeal } from '../../services/dealService'
import { getCustomers } from '../../services/customerService'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import { DEAL_STAGES } from '../../utils/constants'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const STAGE_OPTIONS = Object.keys(DEAL_STAGES)

export default function DealForm() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(isEdit)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      customerId: '',
      value: '',
      probability: '',
      expectedCloseDate: '',
      stage: 'LEAD',
    },
  })

  useEffect(() => {
    loadCustomers()
    if (isEdit) {
      loadDeal()
    }
  }, [id])

  const loadCustomers = async () => {
    try {
      const res = await getCustomers({ limit: 1000 })
      setCustomers(res.data.data || [])
    } catch (error) {
      toast.error(t('messages.customerOptionsLoadFailed'))
    }
  }

  const loadDeal = async () => {
    try {
      setLoading(true)
      const res = await getDeal(id)
      const deal = res.data.data
      reset({
        title: deal.title,
        customerId: deal.customerId?.toString() || '',
        value: deal.value?.toString() || '',
        probability: deal.probability?.toString() || '',
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
        stage: deal.stage,
      })
    } catch (error) {
      toast.error(t('messages.dealLoadFailed'))
      navigate('/deals')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        customerId: parseInt(data.customerId),
        value: parseFloat(data.value),
        probability: parseInt(data.probability),
      }

      if (isEdit) {
        await updateDeal(id, payload)
        toast.success(t('messages.dealUpdated'))
      } else {
        await createDeal(payload)
        toast.success(t('messages.dealCreated'))
      }
      navigate('/deals')
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.dealSaveFailed'))
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/deals')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? t('deals.editDeal') : t('deals.addDeal')}
          </h1>
          <p className="text-gray-600">
            {isEdit ? t('deals.editSubtitle') : t('deals.newSubtitle')}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('deals.fieldTitle')}
            {...register('title', { required: t('validation.required', { field: t('deals.fieldTitle') }) })}
            error={errors.title?.message}
          />

          <Select
            label={t('common.customer')}
            {...register('customerId', { required: t('validation.required', { field: t('common.customer') }) })}
            error={errors.customerId?.message}
          >
            <option value="">{t('deals.selectCustomer')}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </Select>

          <Input
            label={t('common.value')}
            type="number"
            step="0.01"
            {...register('value', {
              required: t('validation.required', { field: t('common.value') }),
              min: { value: 0, message: t('deals.valuePositive') },
            })}
            error={errors.value?.message}
          />

          <Input
            label={t('deals.probabilityPercent')}
            type="number"
            {...register('probability', {
              required: t('validation.required', { field: t('common.probability') }),
              min: { value: 0, message: t('deals.probabilityMin') },
              max: { value: 100, message: t('deals.probabilityMax') },
            })}
            error={errors.probability?.message}
          />

          <Input
            label={t('common.expectedCloseDate')}
            type="date"
            {...register('expectedCloseDate', { required: t('validation.required', { field: t('common.expectedCloseDate') }) })}
            error={errors.expectedCloseDate?.message}
          />

          <Select
            label={t('common.stage')}
            {...register('stage', { required: t('validation.required', { field: t('common.stage') }) })}
            error={errors.stage?.message}
          >
            {STAGE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {enumLabel(t, 'deals.stages', s)}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/deals')}
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
