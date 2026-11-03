import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { enumLabel } from '../../i18n/labels'
import {
  getQuote,
  updateQuoteStatus,
  deleteQuote,
  downloadQuotePDF,
} from '../../services/quoteService'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import { formatCurrency, formatDate } from '../../utils/formatters'
import {
  ArrowLeft,
  Edit,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function QuoteDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuote()
  }, [id])

  const loadQuote = async () => {
    try {
      setLoading(true)
      const res = await getQuote(id)
      setQuote(res.data.data)
    } catch (error) {
      toast.error(t('messages.quoteLoadFailed'))
      navigate('/quotes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    try {
      await updateQuoteStatus(id, status)
      toast.success(t('messages.quoteStatusUpdated', { status: t(`quotes.statuses.${status}`) }))
      loadQuote()
    } catch (error) {
      toast.error(t('messages.quoteStatusFailed'))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('quotes.deleteConfirm'))) return
    try {
      await deleteQuote(id)
      toast.success(t('messages.quoteDeleted'))
      navigate('/quotes')
    } catch (error) {
      toast.error(t('messages.quoteDeleteFailed'))
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const res = await downloadQuotePDF(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `quote-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(t('messages.pdfDownloaded'))
    } catch (error) {
      toast.error(t('messages.pdfDownloadFailed'))
    }
  }

  if (loading) return <Loading />
  if (!quote) return null

  const isAdmin = user?.role === 'ADMIN'
  const canManage = isAdmin || user?.role === 'SALES'
  const isDraft = quote.status === 'DRAFT'
  const isSent = quote.status === 'SENT'

  const grandTotal = quote.items?.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0)
  }, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotes')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {t('quotes.quoteNumberHash', { number: quote.quoteNumber || quote.id })}
            </h1>
            <p className="text-gray-600">{t('quotes.detailsSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isDraft && canManage && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/quotes/${id}/edit`)}
            >
              <Edit className="w-4 h-4" />
              {t('common.edit')}
            </Button>
          )}
          <Button variant="secondary" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4" />
            {t('common.download')}
          </Button>
          {isDraft && canManage && (
            <Button onClick={() => handleStatusChange('SENT')}>
              <Send className="w-4 h-4" />
              {t('quotes.send')}
            </Button>
          )}
          {isSent && canManage && (
            <>
              <Button
                variant="secondary"
                onClick={() => handleStatusChange('ACCEPTED')}
              >
                <CheckCircle className="w-4 h-4" />
                {t('quotes.accept')}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleStatusChange('REJECTED')}
              >
                <XCircle className="w-4 h-4" />
                {t('quotes.reject')}
              </Button>
            </>
          )}
          {isDraft && isAdmin && (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={getStatusVariant(quote.status)}>
          {enumLabel(t, 'quotes.statuses', quote.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('quotes.information')}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">{t('quotes.quoteNumber')}</p>
              <p className="text-base font-medium text-gray-900">
                {quote.quoteNumber || `#${quote.id}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('quotes.validUntil')}</p>
              <p className="text-base font-medium text-gray-900">
                {formatDate(quote.validUntil)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('common.deal')}</p>
              <button
                onClick={() => quote.dealId && navigate(`/deals/${quote.dealId}`)}
                className="text-base font-medium text-blue-600 hover:text-blue-800"
              >
                {quote.deal?.title || '-'}
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('common.customer')}</p>
              <p className="text-base font-medium text-gray-900">
                {quote.deal?.customer?.companyName || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('common.salesRep')}</p>
              <p className="text-base font-medium text-gray-900">
                {quote.deal?.salesRep?.fullName || '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card title={t('quotes.items')}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('common.name')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('quotes.qty')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('quotes.unitPrice')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('quotes.lineTotal')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quote.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {item.name || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td
                    colSpan="3"
                    className="px-4 py-3 text-sm font-medium text-gray-700 text-right"
                  >
                    {t('quotes.grandTotal')}
                  </td>
                  <td className="px-4 py-3 text-base font-bold text-blue-600">
                    {formatCurrency(quote.total || grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
