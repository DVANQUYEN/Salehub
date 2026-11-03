import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDealsKanban, updateDealStage } from '../../services/dealService'
import Loading from '../../components/common/Loading'
import Button from '../../components/common/Button'
import { DEAL_STAGES } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import { ArrowLeft, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const STAGE_KEYS = Object.keys(DEAL_STAGES)

const getStageBorderColor = (stage) => {
  switch (stage) {
    case 'LEAD': return 'border-t-gray-400'
    case 'QUALIFICATION': return 'border-t-yellow-400'
    case 'PROPOSAL': return 'border-t-orange-400'
    case 'NEGOTIATION': return 'border-t-purple-400'
    case 'CLOSED_WON': return 'border-t-green-400'
    case 'CLOSED_LOST': return 'border-t-red-400'
    default: return 'border-t-gray-400'
  }
}

const getStageBadgeColor = (stage) => {
  switch (stage) {
    case 'LEAD': return 'bg-gray-100 text-gray-800'
    case 'QUALIFICATION': return 'bg-yellow-100 text-yellow-800'
    case 'PROPOSAL': return 'bg-orange-100 text-orange-800'
    case 'NEGOTIATION': return 'bg-purple-100 text-purple-800'
    case 'CLOSED_WON': return 'bg-green-100 text-green-800'
    case 'CLOSED_LOST': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function DealKanban() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [columns, setColumns] = useState({})
  const [loading, setLoading] = useState(true)
  const [draggingId, setDraggingId] = useState(null)

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      setLoading(true)
      const res = await getDealsKanban()
      const data = res.data.data

      // Handle both grouped and flat response shapes
      if (Array.isArray(data)) {
        const grouped = {}
        STAGE_KEYS.forEach((stage) => (grouped[stage] = []))
        data.forEach((deal) => {
          if (!grouped[deal.stage]) grouped[deal.stage] = []
          grouped[deal.stage].push(deal)
        })
        setColumns(grouped)
      } else if (data && typeof data === 'object') {
        const grouped = {}
        STAGE_KEYS.forEach((stage) => (grouped[stage] = data[stage] || []))
        setColumns(grouped)
      } else {
        const grouped = {}
        STAGE_KEYS.forEach((stage) => (grouped[stage] = []))
        setColumns(grouped)
      }
    } catch (error) {
      toast.error(t('messages.kanbanLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e, dealId) => {
    setDraggingId(dealId)
    e.dataTransfer.setData('text/plain', dealId.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, stage) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData('text/plain')
    if (!dealId) return

    try {
      await updateDealStage(dealId, stage)
      toast.success(t('messages.dealMovedTo', { stage: enumLabel(t, 'deals.stages', stage) }))
      loadDeals()
    } catch (error) {
      toast.error(t('messages.dealMoveFailed'))
    } finally {
      setDraggingId(null)
    }
  }

  const handleDragEnd = () => {
    setDraggingId(null)
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/deals')}
            aria-label={t('common.back')}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('deals.pipelineTitle')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('deals.dragToMove')}</p>
          </div>
        </div>
        <Button onClick={() => navigate('/deals/new')}>
          <Plus className="w-5 h-5" aria-hidden="true" />
          {t('deals.addDeal')}
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {STAGE_KEYS.map((stage) => (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className="min-w-[280px] w-[280px] flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 flex flex-col"
          >
            <div className={`p-4 border-t-4 rounded-t-lg ${getStageBorderColor(stage)} bg-white`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{enumLabel(t, 'deals.stages', stage)}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStageBadgeColor(stage)}`}>
                  {columns[stage]?.length || 0}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {columns[stage]?.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => navigate(`/deals/${deal.id}`)}
                  className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow ${
                    draggingId === deal.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{deal.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {deal.customer?.companyName || t('customers.unknown')}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm font-medium text-blue-600">
                      {formatCurrency(deal.value)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {deal.probability || 0}%
                    </p>
                  </div>
                </div>
              ))}
              {columns[stage]?.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  {t('deals.dropHere')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
