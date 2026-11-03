import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { enumLabel } from '../../i18n/labels'
import { getCustomer, deleteCustomer } from '../../services/customerService'
import { getDeals } from '../../services/dealService'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ArrowLeft, Edit, Trash2, Target, Mail, Phone, MapPin, User } from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function CustomerDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customer, setCustomer] = useState(null)
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    loadCustomer()
  }, [id])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      const [customerRes, dealsRes] = await Promise.all([
        getCustomer(id),
        getDeals({ customerId: id, limit: 100 }),
      ])
      setCustomer(customerRes.data.data)
      setDeals(dealsRes.data.data || [])
    } catch (error) {
      toast.error(t('messages.customerLoadFailed'))
      navigate('/customers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('customers.deleteConfirm'))) return
    try {
      await deleteCustomer(id)
      toast.success(t('messages.customerDeleted'))
      navigate('/customers')
    } catch (error) {
      toast.error(t('messages.customerDeleteFailed'))
    }
  }

  if (loading) return <Loading />
  if (!customer) return null

  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{customer.companyName}</h1>
            <p className="text-gray-600">{t('customers.detailsSubtitle')}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/${id}/edit`)}
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
        <Badge variant={getStatusVariant(customer.status)}>
          {enumLabel(t, 'statuses', customer.status)}
        </Badge>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'info', label: t('customers.tabInfo') },
            { key: 'deals', label: t('customers.tabDeals') },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('customers.contactName')}</p>
                <p className="text-base font-medium text-gray-900">{customer.contactName || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.email')}</p>
                <p className="text-base font-medium text-gray-900">{customer.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.phone')}</p>
                <p className="text-base font-medium text-gray-900">{customer.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t('common.address')}</p>
                <p className="text-base font-medium text-gray-900">{customer.address || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('common.createdAt')}</p>
              <p className="text-base font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'deals' && (
        <Card title={t('customers.deals')} actions={<Target className="w-5 h-5 text-gray-400" />}>
          {deals.length === 0 ? (
            <EmptyState
              title={t('common.noData')}
              description={t('customers.noDealsDesc')}
            />
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => navigate(`/deals/${deal.id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <p className="text-sm font-medium text-blue-600">{formatCurrency(deal.value)}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('deals.expectedCloseWithDate', { date: formatDate(deal.expectedCloseDate) })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
