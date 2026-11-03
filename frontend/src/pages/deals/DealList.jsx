import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDeals, deleteDeal } from '../../services/dealService'
import { useAuth } from '../../hooks/useAuth'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import IconButton from '../../components/common/IconButton'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/forms/Pagination'
import { DEAL_STAGES } from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import { Plus, Edit, Trash2, LayoutGrid } from 'lucide-react'
import toast from 'react-hot-toast'

const STAGE_KEYS = Object.keys(DEAL_STAGES)

const getStageVariant = (stage) => {
  switch (stage) {
    case 'LEAD': return 'default'
    case 'QUALIFICATION': return 'warning'
    case 'PROPOSAL': return 'orange'
    case 'NEGOTIATION': return 'purple'
    case 'CLOSED_WON': return 'success'
    case 'CLOSED_LOST': return 'danger'
    default: return 'default'
  }
}

const SORT_OPTIONS = [
  { key: 'createdAt-desc', labelKey: 'deals.sort.newest' },
  { key: 'createdAt-asc', labelKey: 'deals.sort.oldest' },
  { key: 'value-desc', labelKey: 'deals.sort.highestValue' },
  { key: 'value-asc', labelKey: 'deals.sort.lowestValue' },
  { key: 'expectedCloseDate-asc', labelKey: 'deals.sort.closeEarliest' },
  { key: 'expectedCloseDate-desc', labelKey: 'deals.sort.closeLatest' },
]

export default function DealList() {
  const { t } = useTranslation()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadDeals()
  }, [stage, sortBy, sortOrder, page])

  const loadDeals = async () => {
    try {
      setLoading(true)
      const res = await getDeals({ stage, sortBy, sortOrder, page, limit: 10 })
      setDeals(res.data.data || [])
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      toast.error(t('messages.dealsLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(t('deals.deleteConfirm'))) return
    try {
      await deleteDeal(id)
      toast.success(t('messages.dealDeleted'))
      loadDeals()
    } catch (error) {
      toast.error(t('messages.dealDeleteFailed'))
    }
  }

  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES'

  const columns = [
    { header: t('deals.title_field'), accessor: 'title' },
    { header: t('common.customer'), render: (row) => row.customer?.companyName || '-' },
    { header: t('deals.salesRep'), render: (row) => row.salesRep?.fullName || '-' },
    {
      header: t('deals.stage'),
      render: (row) => (
        <Badge variant={getStageVariant(row.stage)}>
          {enumLabel(t, 'deals.stages', row.stage)}
        </Badge>
      ),
    },
    { header: t('deals.value'), render: (row) => formatCurrency(row.value) },
    { header: t('deals.probability'), render: (row) => `${row.probability || 0}%` },
    { header: t('deals.expectedCloseDate'), render: (row) => formatDate(row.expectedCloseDate) },
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
                navigate(`/deals/${row.id}/edit`)
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('deals.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('deals.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/deals/kanban')}
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            {t('deals.kanbanView')}
          </Button>
          {canManage && (
            <Button onClick={() => navigate('/deals/new')}>
              <Plus className="w-5 h-5" aria-hidden="true" />
              {t('deals.addDeal')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          aria-label={t('deals.filterByStage')}
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">{t('deals.allStages')}</option>
          {STAGE_KEYS.map((s) => (
            <option key={s} value={s}>
              {enumLabel(t, 'deals.stages', s)}
            </option>
          ))}
        </select>

        <select
          aria-label={t('deals.sortBy')}
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-')
            setSortBy(field)
            setSortOrder(order)
          }}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={deals}
        loading={loading}
        onRowClick={(deal) => navigate(`/deals/${deal.id}`)}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
