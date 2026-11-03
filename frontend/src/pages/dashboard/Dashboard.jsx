import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getOverview, getSalesMetrics } from '../../services/dashboardService'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { enumLabel } from '../../i18n/labels'
import {
  DollarSign, Users, Target, TrendingUp,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

export default function Dashboard() {
  const { t } = useTranslation()
  const [overview, setOverview] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  // Translated stage label per slice so the legend/tooltip follow the active language.
  const pipelineData = useMemo(
    () =>
      (overview?.dealsByStage || []).map((item) => ({
        ...item,
        label: enumLabel(t, 'deals.stages', item.stage),
      })),
    [overview, t]
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [overviewRes, metricsRes] = await Promise.all([
        getOverview(),
        getSalesMetrics()
      ])
      setOverview(overviewRes.data.data)
      setMetrics(metricsRes.data.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  const statStyles = {
    primary: { card: 'from-white to-primary-50', icon: 'bg-primary-100 text-primary-600' },
    green: { card: 'from-white to-emerald-50', icon: 'bg-emerald-100 text-emerald-600' },
    purple: { card: 'from-white to-violet-50', icon: 'bg-violet-100 text-violet-600' },
    orange: { card: 'from-white to-amber-50', icon: 'bg-amber-100 text-amber-600' },
  }

  const stats = [
    {
      label: t('dashboard.totalRevenue'),
      value: formatCurrency(overview?.totalRevenue || 0),
      icon: DollarSign,
      color: 'primary',
      change: '+12%'
    },
    {
      label: t('dashboard.totalDeals'),
      value: formatNumber(overview?.totalDeals || 0),
      icon: Target,
      color: 'green',
      change: '+8%'
    },
    {
      label: t('dashboard.totalCustomers'),
      value: formatNumber(overview?.totalCustomers || 0),
      icon: Users,
      color: 'purple',
      change: '+15%'
    },
    {
      label: t('dashboard.conversionRate'),
      value: `${(overview?.conversionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'orange',
      change: '+5%'
    },
  ]

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  const recentDeals = (overview?.recentDeals || []).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('dashboard.welcome')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-br ${statStyles[stat.color].card} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 truncate text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change.startsWith('+') ? <ArrowUpRight className="w-4 h-4" aria-hidden="true" /> : <ArrowDownRight className="w-4 h-4" aria-hidden="true" />}
                  {stat.change} {t('dashboard.fromLastMonth')}
                </p>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${statStyles[stat.color].icon}`}>
                <stat.icon className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title={t('dashboard.monthlyRevenue')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} />
              <Bar dataKey="revenue" name={t('dashboard.totalRevenue')} fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t('dashboard.pipelineByStage')}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pipelineData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pipelineData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title={t('dashboard.recentDeals')}>
        {recentDeals.length === 0 ? (
          <EmptyState
            icon={Target}
            title={t('dashboard.noDeals')}
            description={t('dashboard.noDealsDesc')}
          />
        ) : (
          <div className="space-y-3">
            {recentDeals.map(deal => (
              <div
                key={deal.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{deal.title}</p>
                  <p className="truncate text-sm text-gray-500">{deal.customer?.companyName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(deal.value)}</p>
                  <p className="text-sm text-gray-500">{enumLabel(t, 'deals.stages', deal.stage)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
