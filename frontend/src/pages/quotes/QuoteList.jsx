import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getQuotes,
  deleteQuote,
  downloadQuotePDF,
} from '../../services/quoteService'
import { useAuth } from '../../hooks/useAuth'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import SearchInput from '../../components/forms/SearchInput'
import Pagination from '../../components/forms/Pagination'
import { QUOTE_STATUSES } from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import { Plus, Eye, Download, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_KEYS = Object.keys(QUOTE_STATUSES)

const getStatusVariant = (status) => {
  switch (status) {
    case 'DRAFT': return 'default'
    case 'SENT': return 'info'
    case 'ACCEPTED': return 'success'
    case 'REJECTED': return 'danger'
    case 'EXPIRED': return 'warning'
    default: return 'default'
  }
}

export default function QuoteList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES'
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadQuotes()
  }, [search, status, page])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const res = await getQuotes({ search, status, page, limit: 10 })
      setQuotes(res.data.data || [])
      setTotalPages(res.data.meta?.totalPages || 1)
    } catch (error) {
      toast.error(t('messages.quotesLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(t('quotes.deleteConfirm'))) return
    try {
      await deleteQuote(id)
      toast.success(t('messages.quoteDeleted'))
      loadQuotes()
    } catch (error) {
      toast.error(t('messages.quoteDeleteFailed'))
    }
  }

  const handleDownloadPDF = async (quoteId, e) => {
    e.stopPropagation()
    try {
      const res = await downloadQuotePDF(quoteId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `quote-${quoteId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(t('messages.pdfDownloaded'))
    } catch (error) {
      toast.error(t('messages.pdfDownloadFailed'))
    }
  }

  const columns = [
    { header: t('quotes.quoteNumber'), render: (row) => row.quoteNumber || `#${row.id}` },
    { header: t('deals.title_field'), render: (row) => row.deal?.title || '-' },
    { header: t('customers.companyName'), render: (row) => row.deal?.customer?.companyName || '-' },
    { header: t('quotes.totalAmount'), render: (row) => formatCurrency(row.total) },
    {
      header: t('common.status'),
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)}>
          {enumLabel(t, 'quotes.statuses', row.status)}
        </Badge>
      ),
    },
    { header: t('quotes.validUntil'), render: (row) => formatDate(row.validUntil) },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/quotes/${row.id}`)
            }}
            aria-label={t('common.details')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => handleDownloadPDF(row.id, e)}
            aria-label={t('quotes.downloadPdf')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>
          {isAdmin && row.status === 'DRAFT' && (
            <button
              type="button"
              onClick={(e) => handleDelete(row.id, e)}
              aria-label={t('common.delete')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('quotes.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('quotes.subtitle')}</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/quotes/new')}>
            <Plus className="w-5 h-5" aria-hidden="true" />
            {t('quotes.addQuote')}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('quotes.searchPlaceholder') ?? t('common.searchPlaceholder')}
        />
        <select
          aria-label={t('quotes.filterByStatus')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">{t('common.allStatuses')}</option>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {enumLabel(t, 'quotes.statuses', s)}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={quotes}
        loading={loading}
        onRowClick={(quote) => navigate(`/quotes/${quote.id}`)}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
