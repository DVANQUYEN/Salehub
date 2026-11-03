import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { enumLabel } from '../../i18n/labels'
import { getDeal, updateDealStage, deleteDeal } from '../../services/dealService'
import { getQuotes } from '../../services/quoteService'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters'
import {
  ArrowLeft, Edit, Trash2, Target, Calendar, User, Building2,
  TrendingUp, Activity, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

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

const STAGE_FLOW = ['LEAD', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON']

export default function DealDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [deal, setDeal] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeal()
  }, [id])

  const loadDeal = async () => {
    try {
      setLoading(true)
      const [dealRes, quotesRes] = await Promise.all([
        getDeal(id),
        getQuotes({ dealId: id, limit: 100 }),
      ])
      setDeal(dealRes.data.data)
      setQuotes(quotesRes.data.data || [])
    } catch (error) {
      toast.error(t('messages.dealLoadFailed'))
      navigate('/deals')
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (stage) => {
    try {
      await updateDealStage(id, stage)
      toast.success(t('messages.dealStageUpdated', { stage: t(`deals.stages.${stage}`) }))
      loadDeal()
    } catch (error) {
      toast.error(t('messages.dealStageFailed'))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('deals.deleteConfirm'))) return
    try {
      await deleteDeal(id)
      toast.success(t('messages.dealDeleted'))
      navigate('/deals')
    } catch (error) {
      toast.error(t('messages.dealDeleteFailed'))
    }
  }

  if (loading) return <Loading />
  if (!deal) return null

  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES'
  const activities = deal.activities || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/deals')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{deal.title}</h1>
            <p className="text-gray-600">{t('deals.detailsSubtitle')}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/deals/${id}/edit`)}
            >
              <Edit className="w-4 h-4" />
              {t('common.edit')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              {t('common.delete')}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={getStageVariant(deal.stage)}>
          {enumLabel(t, 'deals.stages', deal.stage)}
        </Badge>
      </div>

      {canManage && (
        <Card title={t('deals.quickStageActions')}>
          <div className="flex flex-wrap gap-2">
            {STAGE_FLOW.map((stage) => (
              <Button
                key={stage}
                size="sm"
                variant={deal.stage === stage ? 'primary' : 'secondary'}
                onClick={() => handleStageChange(stage)}
                disabled={deal.stage === stage}
              >
                {t(`deals.stages.${stage}`)}
              </Button>
            ))}
            <Button
              size="sm"
              variant={deal.stage === 'CLOSED_LOST' ? 'danger' : 'secondary'}
              onClick={() => handleStageChange('CLOSED_LOST')}
              disabled={deal.stage === 'CLOSED_LOST'}
            >
              {t('deals.stages.CLOSED_LOST')}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('common.dealInformation')} actions={<Target className="w-5 h-5 text-gray-400" />}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.customer')}</p>
                <p className="text-base font-medium text-gray-900">
                  {deal.customer?.companyName || '-'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.salesRep')}</p>
                <p className="text-base font-medium text-gray-900">
                  {deal.salesRep?.fullName || '-'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.value')}</p>
                <p className="text-base font-medium text-gray-900">{formatCurrency(deal.value)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.probability')}</p>
                <p className="text-base font-medium text-gray-900">{deal.probability || 0}%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.expectedCloseDate')}</p>
                <p className="text-base font-medium text-gray-900">{formatDate(deal.expectedCloseDate)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title={t('common.activities')} actions={<Activity className="w-5 h-5 text-gray-400" />}>
          {activities.length === 0 ? (
            <EmptyState
              title={t('activity.noActivities')}
              description={t('deals.noActivitiesDesc')}
            />
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type ? t(`activity.${activity.type.toLowerCase()}`) : t('deals.activity')}
                    </p>
                    <p className="text-sm text-gray-600">{activity.description || ''}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title={t('common.relatedQuotes')} actions={<FileText className="w-5 h-5 text-gray-400" />}>
        {quotes.length === 0 ? (
          <EmptyState
            title={t('common.noQuotes')}
            description={t('deals.noQuotesDesc')}
          />
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                onClick={() => navigate(`/quotes/${quote.id}`)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-900">{t('quotes.quoteNumberHash', { number: quote.quoteNumber || quote.id })}</p>
                  <p className="text-sm text-gray-500">
                    {t('common.createdOn', { date: formatDate(quote.createdAt) })}
                  </p>
                </div>
                <p className="text-sm font-medium text-blue-600">{formatCurrency(quote.total)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
