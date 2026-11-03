import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProducts, deleteProduct } from '../../services/productService'
import { useAuth } from '../../hooks/useAuth'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import IconButton from '../../components/common/IconButton'
import SearchInput from '../../components/forms/SearchInput'
import Pagination from '../../components/forms/Pagination'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'

const PRODUCT_CATEGORIES = ['Software', 'Hardware', 'Cloud', 'Security', 'Network']

export default function ProductList() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [search, category, page])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await getProducts({ search, category, page, limit: 10 })
      setProducts(res.data.data || [])
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      toast.error(t('messages.productsLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id, e) => {
    e.stopPropagation()
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteProduct(deleteTarget)
      toast.success(t('messages.productDeleted'))
      setDeleteTarget(null)
      loadProducts()
    } catch (error) {
      toast.error(t('messages.productDeleteFailed'))
    }
  }

  const columns = [
    { header: t('common.name'), accessor: 'name' },
    { header: t('products.category'), render: (row) => enumLabel(t, 'products.categories', row.category) || '-' },
    { header: t('products.price'), render: (row) => formatCurrency(row.price) },
    { header: t('common.createdAt'), render: (row) => formatDate(row.createdAt) },
    ...(user?.role === 'ADMIN' ? [{
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton
            icon={Edit}
            label={t('common.edit')}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/products/${row.id}/edit`)
            }}
          />
          <IconButton
            icon={Trash2}
            label={t('common.delete')}
            variant="danger"
            onClick={(e) => handleDeleteClick(row.id, e)}
          />
        </div>
      ),
    }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('products.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('products.subtitle')}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => navigate('/products/new')}>
            <Plus className="w-5 h-5" aria-hidden="true" />
            {t('products.addProduct')}
          </Button>
        )}
      </div>

      {user?.role !== 'ADMIN' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">{t('products.adminOnlyNoticeTitle')}</p>
          <p className="mt-1 text-amber-700">{t('products.adminOnlyNotice')}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('products.searchPlaceholder')}
        />
        <select
          aria-label={t('products.filterByCategory')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">{t('products.allCategories')}</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {enumLabel(t, 'products.categories', cat)}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={products}
        loading={loading}
        onRowClick={(product) => navigate(`/products/${product.id}`)}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('common.delete')}
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-6">{t('products.deleteConfirm')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
