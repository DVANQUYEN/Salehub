import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCustomers, deleteCustomer } from '../../services/customerService'
import { useAuth } from '../../hooks/useAuth'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import IconButton from '../../components/common/IconButton'
import Badge from '../../components/common/Badge'
import SearchInput from '../../components/forms/SearchInput'
import Pagination from '../../components/forms/Pagination'
import { CUSTOMER_STATUSES } from '../../utils/constants'
import { enumLabel } from '../../i18n/labels'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_KEYS = Object.keys(CUSTOMER_STATUSES)

const getStatusVariant = (status) => {
  switch (status) {
    case 'NEW': return 'default'
    case 'CONTACTED': return 'info'
    case 'QUALIFIED': return 'warning'
    case 'PROPOSAL': return 'orange'
    case 'CLOSED': return 'success'
    default: return 'default'
  }
}

export default function CustomerList() {
  const { t } = useTranslation()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadCustomers()
  }, [search, status, page])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const res = await getCustomers({ search, status, page, limit: 10 })
      setCustomers(res.data.data || [])
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      toast.error(t('messages.customersLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(t('customers.deleteConfirm'))) return
    try {
      await deleteCustomer(id)
      toast.success(t('messages.customerDeleted'))
      loadCustomers()
    } catch (error) {
      toast.error(t('messages.customerDeleteFailed'))
    }
  }

  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES'

  const columns = [
    { header: t('customers.companyName'), accessor: 'companyName' },
    { header: t('customers.contactName'), render: (row) => row.contactName || '-' },
    { header: t('common.email'), render: (row) => row.email || '-' },
    { header: t('common.phone'), render: (row) => row.phone || '-' },
    {
      header: t('common.status'),
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)}>
          {enumLabel(t, 'statuses', row.status)}
        </Badge>
      ),
    },
    {
      header: t('common.actions'),
      render: (row) =>
        canManage && (
          <div className="flex items-center gap-1">
            <IconButton
              icon={Edit}
              label={t('common.edit')}
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/customers/${row.id}/edit`)
              }}
            />
            <IconButton
              icon={Trash2}
              label={t('common.delete')}
              variant="danger"
              onClick={(e) => handleDelete(row.id, e)}
            />
          </div>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('customers.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('customers.subtitle')}</p>
        </div>
        {canManage && (
          <Button onClick={() => navigate('/customers/new')}>
            <Plus className="w-5 h-5" aria-hidden="true" />
            {t('customers.addCustomer')}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('customers.searchPlaceholder')}
        />
        <select
          aria-label={t('customers.filterByStatus')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">{t('customers.allStatuses')}</option>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {enumLabel(t, 'statuses', s)}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={customers}
        loading={loading}
        onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
