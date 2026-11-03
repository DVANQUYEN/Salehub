import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDeals } from '../../services/dealService'
import { getQuote, createQuote, updateQuote } from '../../services/quoteService'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/formatters'

const getDefaultValidUntil = () => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().split('T')[0]
}

export default function QuoteForm() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      dealId: '',
      validUntil: getDefaultValidUntil(),
      status: 'DRAFT',
      items: [{ name: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const [deals, setDeals] = useState([])
  const watchItems = watch('items')

  useEffect(() => {
    loadDeals()
    if (isEdit) {
      loadQuote()
    }
  }, [id])

  const loadDeals = async () => {
    try {
      const res = await getDeals({ limit: 1000 })
      setDeals(res.data.data || [])
    } catch (error) {
      toast.error(t('messages.dealOptionsLoadFailed'))
    }
  }

  const loadQuote = async () => {
    try {
      const res = await getQuote(id)
      const quote = res.data.data
      reset({
        dealId: quote.dealId?.toString() || '',
        validUntil: quote.validUntil ? quote.validUntil.split('T')[0] : getDefaultValidUntil(),
        status: quote.status || 'DRAFT',
        items: quote.items?.length
          ? quote.items.map((item) => ({
              name: item.name || '',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          : [{ name: '', quantity: 1, unitPrice: 0 }],
      })
    } catch (error) {
      toast.error(t('messages.quoteLoadFailed'))
      navigate('/quotes')
    }
  }

  const calculateLineTotal = (quantity, unitPrice) => {
    return (Number(quantity) || 0) * (Number(unitPrice) || 0)
  }

  const grandTotal = watchItems?.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.unitPrice)
  }, 0) || 0

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        dealId: Number(data.dealId),
        items: data.items.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      }

      if (isEdit) {
        await updateQuote(id, payload)
        toast.success(t('messages.quoteUpdated'))
      } else {
        await createQuote(payload)
        toast.success(t('messages.quoteCreated'))
      }
      navigate('/quotes')
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.quoteSaveFailed'))
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/quotes')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? t('quotes.editQuote') : t('quotes.addQuote')}
          </h1>
          <p className="text-gray-600">
            {isEdit ? t('quotes.editSubtitle') : t('quotes.newSubtitle')}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('common.deal')}
              {...register('dealId', { required: t('validation.required', { field: t('common.deal') }) })}
              error={errors.dealId?.message}
            >
              <option value="">{t('quotes.selectDeal')}</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.title} - {deal.customer?.companyName || t('customers.noCustomer')}
                </option>
              ))}
            </Select>

            <Input
              label={t('quotes.validUntil')}
              type="date"
              {...register('validUntil', { required: t('validation.required', { field: t('quotes.validUntil') }) })}
              error={errors.validUntil?.message}
            />
          </div>

          <Input
            label={t('common.status')}
            {...register('status')}
            disabled
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                {t('quotes.items')}
              </label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })}
              >
                <Plus className="w-4 h-4" />
                {t('quotes.addItem')}
              </Button>
            </div>

            {errors.items?.message && (
              <p className="text-sm text-red-600">{errors.items.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const item = watchItems?.[index] || {}
                const lineTotal = calculateLineTotal(item.quantity, item.unitPrice)

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="md:col-span-4">
                      <Input
                        placeholder={t('quotes.itemNamePlaceholder')}
                        {...register(`items.${index}.name`, {
                          required: t('validation.required', { field: t('common.name') }),
                        })}
                        error={errors.items?.[index]?.name?.message}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        placeholder={t('quotes.qty')}
                        min="1"
                        {...register(`items.${index}.quantity`, {
                          required: t('validation.requiredGeneric'),
                          min: { value: 1, message: t('quotes.min', { min: 1 }) },
                          valueAsNumber: true,
                        })}
                        error={errors.items?.[index]?.quantity?.message}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        type="number"
                        placeholder={t('quotes.unitPricePlaceholder')}
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.unitPrice`, {
                          required: t('validation.requiredGeneric'),
                          min: { value: 0, message: t('quotes.min', { min: 0 }) },
                          valueAsNumber: true,
                        })}
                        error={errors.items?.[index]?.unitPrice?.message}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      <p className="text-sm font-medium text-gray-700">
                        {formatCurrency(lineTotal)}
                      </p>
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">{t('quotes.grandTotal')}</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(grandTotal)}</p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/quotes')}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEdit ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
