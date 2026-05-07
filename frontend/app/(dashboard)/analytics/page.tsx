// app/(dashboard)/analytics/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Clock, AlertCircle, BarChart3 } from 'lucide-react'
import api from '@/lib/api/client'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const statsRes = await api.getIncidentStats()
      setStats(statsRes.data.data)
      
      // Mock trend data (would come from API in production)
      setTrends({
        incidents_this_week: 12,
        incidents_last_week: 15,
        mttr_this_week: 2.3,
        mttr_last_week: 3.1,
        by_severity: [
          { severity: 'SEV1', count: 2, percentage: 17 },
          { severity: 'SEV2', count: 5, percentage: 42 },
          { severity: 'SEV3', count: 3, percentage: 25 },
          { severity: 'SEV4', count: 2, percentage: 16 }
        ]
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
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

  const incidentChange = trends.incidents_this_week - trends.incidents_last_week
  const mttrChange = trends.mttr_this_week - trends.mttr_last_week

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-400">Incident metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Total Incidents"
          value={stats?.total || 0}
          icon={AlertCircle}
          color="text-red-400"
        />
        <MetricCard
          label="Avg Resolution Time"
          value={`${stats?.avg_resolution_hours?.toFixed(1) || 0}h`}
          icon={Clock}
          color="text-blue-400"
        />
        <MetricCard
          label="Open Incidents"
          value={stats?.investigating || 0}
          icon={TrendingUp}
          color="text-orange-400"
        />
        <MetricCard
          label="Resolved"
          value={stats?.resolved || 0}
          icon={TrendingDown}
          color="text-green-400"
        />
      </div>

      {/* Trends */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Incident Volume</h2>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold mb-2">{trends.incidents_this_week}</div>
              <div className="text-sm text-gray-400">This week</div>
            </div>
            <div className={`flex items-center gap-2 ${incidentChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
              {incidentChange < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
              <span className="font-semibold">{Math.abs(incidentChange)}</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            vs {trends.incidents_last_week} last week
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Mean Time To Resolution</h2>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold mb-2">{trends.mttr_this_week}h</div>
              <div className="text-sm text-gray-400">This week</div>
            </div>
            <div className={`flex items-center gap-2 ${mttrChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
              {mttrChange < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
              <span className="font-semibold">{Math.abs(mttrChange).toFixed(1)}h</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            vs {trends.mttr_last_week}h last week
          </div>
        </div>
      </div>

      {/* By Severity */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-6">Incidents by Severity</h2>
        <div className="space-y-4">
          {trends.by_severity.map((item: any) => (
            <div key={item.severity}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{item.severity}</span>
                <span className="text-gray-400">{item.count} incidents ({item.percentage}%)</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    item.severity === 'SEV1' ? 'bg-red-500' :
                    item.severity === 'SEV2' ? 'bg-orange-500' :
                    item.severity === 'SEV3' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={color} size={20} />
        <span className="text-sm text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
