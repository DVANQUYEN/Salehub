import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProduct, deleteProduct } from '../../services/productService'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'

export default function ProductDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const res = await getProduct(id)
      setProduct(res.data.data)
    } catch (error) {
      toast.error(t('messages.productLoadFailed'))
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteProduct(id)
      toast.success(t('messages.productDeleted'))
      setShowDeleteModal(false)
      navigate('/products')
    } catch (error) {
      toast.error(t('messages.productDeleteFailed'))
    }
  }

  if (loading) return <Loading />
  if (!product) return null

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            aria-label={t('common.back')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-600">{t('products.detailsSubtitle')}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/products/${id}/edit`)}
            >
              <Edit className="w-4 h-4" />
              {t('common.edit')}
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4" />
              {t('common.delete')}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">{t('common.name')}</p>
            <p className="text-base font-medium text-gray-900">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('products.category')}</p>
            <p className="text-base font-medium text-gray-900">{enumLabel(t, 'products.categories', product.category) || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('products.price')}</p>
            <p className="text-base font-medium text-gray-900">{formatCurrency(product.price)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('common.createdAt')}</p>
            <p className="text-base font-medium text-gray-900">{formatDate(product.createdAt)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">{t('products.description')}</p>
            <p className="text-base text-gray-900 mt-1">{product.description || t('products.noDescription')}</p>
          </div>
          {product?.specifications && (
            <div className="mt-4 md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-3">{t('products.specifications')}</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {typeof product.specifications === 'object' ? (
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex gap-4">
                        <span className="font-medium text-gray-700 min-w-[150px] capitalize">
                          {key}:
                        </span>
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">{product.specifications}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
