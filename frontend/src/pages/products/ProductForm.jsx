import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { enumLabel } from '../../i18n/labels'
import { getProduct, createProduct, updateProduct } from '../../services/productService'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const PRODUCT_CATEGORIES = ['Software', 'Hardware', 'Cloud', 'Security', 'Network']

export default function ProductForm() {
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
      name: '',
      description: '',
      category: '',
      price: '',
      specifications: '',
    },
  })

  useEffect(() => {
    if (isEdit) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      const res = await getProduct(id)
      const product = res.data.data
      reset({
        ...product,
        price: product.price?.toString() || '',
        specifications: product.specifications
          ? JSON.stringify(product.specifications, null, 2)
          : '',
      })
    } catch (error) {
      toast.error(t('messages.productLoadFailed'))
      navigate('/products')
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        specifications: data.specifications
          ? JSON.parse(data.specifications)
          : undefined,
      }

      if (isEdit) {
        await updateProduct(id, payload)
        toast.success(t('messages.productUpdated'))
      } else {
        await createProduct(payload)
        toast.success(t('messages.productCreated'))
      }
      navigate('/products')
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.productSaveFailed'))
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? t('products.editProduct') : t('products.addProduct')}
          </h1>
          <p className="text-gray-600">
            {isEdit ? t('products.editSubtitle') : t('products.newSubtitle')}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('common.name')}
            {...register('name', { required: t('validation.required', { field: t('common.name') }) })}
            error={errors.name?.message}
          />

          <Select
            label={t('products.category')}
            {...register('category', { required: t('validation.required', { field: t('products.category') }) })}
            error={errors.category?.message}
          >
            <option value="">{t('products.selectCategory')}</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {enumLabel(t, 'products.categories', cat)}
              </option>
            ))}
          </Select>

          <Input
            label={t('products.price')}
            type="number"
            step="0.01"
            {...register('price', {
              required: t('validation.required', { field: t('products.price') }),
              min: { value: 0, message: t('products.pricePositive') },
              valueAsNumber: false,
            })}
            error={errors.price?.message}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('products.description')}
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('products.specificationsJson')}
            </label>
            <textarea
              {...register('specifications')}
              rows={4}
              placeholder='{"key": "value"}'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            {errors.specifications && (
              <p className="text-sm text-red-600">
                {errors.specifications.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/products')}
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
