// app/(dashboard)/executive/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle, Activity } from 'lucide-react'
import api from '@/lib/api/client'

export default function ExecutiveDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      // Would call advanced analytics endpoint
      const mockData = {
        total_incidents: 156,
        sev1_count: 12,
        sev2_count: 28,
        resolved_count: 142,
        avg_mttr_hours: 3.2,
        avg_mttd_hours: 0.8,
        sla_compliance: 94.5,
        incident_trend: -8.5, // % change from last period
        mttr_trend: -12.3,
        sla_trend: 2.1
      }
      setMetrics(mockData)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Executive Dashboard</h1>
        <p className="text-gray-400">High-level insights and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Incidents"
          value={metrics.total_incidents}
          trend={metrics.incident_trend}
          icon={AlertCircle}
          color="text-blue-400"
        />
        <MetricCard
          title="Mean Time to Resolve"
          value={`${metrics.avg_mttr_hours}h`}
          trend={metrics.mttr_trend}
          icon={Clock}
          color="text-orange-400"
        />
        <MetricCard
          title="SLA Compliance"
          value={`${metrics.sla_compliance}%`}
          trend={metrics.sla_trend}
          icon={CheckCircle}
          color="text-green-400"
        />
        <MetricCard
          title="Critical Incidents"
          value={metrics.sev1_count + metrics.sev2_count}
          trend={-5.2}
          icon={Activity}
          color="text-red-400"
        />
      </div>

      {/* Charts & Reports */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Incident Distribution</h2>
          <div className="space-y-4">
            {[
              { label: 'SEV1', count: 12, percentage: 7.7, color: 'bg-red-500' },
              { label: 'SEV2', count: 28, percentage: 17.9, color: 'bg-orange-500' },
              { label: 'SEV3', count: 64, percentage: 41.0, color: 'bg-yellow-500' },
              { label: 'SEV4', count: 52, percentage: 33.3, color: 'bg-gray-500' }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-400">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Resolution Time Trends</h2>
          <div className="space-y-6">
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">
                {metrics.avg_mttr_hours}h
              </div>
              <div className="text-sm text-gray-400">Average MTTR</div>
              <div className="flex items-center gap-2 mt-2">
                {metrics.mttr_trend < 0 ? (
                  <TrendingDown className="text-green-400" size={20} />
                ) : (
                  <TrendingUp className="text-red-400" size={20} />
                )}
                <span className={metrics.mttr_trend < 0 ? 'text-green-400' : 'text-red-400'}>
                  {Math.abs(metrics.mttr_trend)}% vs last month
                </span>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {metrics.avg_mttd_hours}h
              </div>
              <div className="text-sm text-gray-400">Average MTTD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, trend, icon: Icon, color }: any) {
  const isPositive = trend > 0
  const trendColor = title.includes('SLA') || title.includes('Compliance')
    ? isPositive ? 'text-green-400' : 'text-red-400'
    : isPositive ? 'text-red-400' : 'text-green-400'

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={color} size={24} />
        <span className="text-sm text-gray-400 uppercase tracking-wide">{title}</span>
      </div>
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="flex items-center gap-2">
        {isPositive ? <TrendingUp className={trendColor} size={16} /> : <TrendingDown className={trendColor} size={16} />}
        <span className={`text-sm ${trendColor}`}>
          {Math.abs(trend)}% vs last month
        </span>
      </div>
    </div>
  )
}
