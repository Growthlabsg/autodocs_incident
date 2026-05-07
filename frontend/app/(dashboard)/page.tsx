// app/(dashboard)/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import api from '@/lib/api/client'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, incidentsRes] = await Promise.all([
          api.getIncidentStats(),
          api.getIncidents({ limit: 5 })
        ])
        setStats(statsRes.data.data)
        setIncidents(incidentsRes.data.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={AlertCircle}
          label="Total Incidents"
          value={stats?.total || 0}
          color="text-red-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Investigating"
          value={stats?.investigating || 0}
          color="text-orange-400"
        />
        <StatCard
          icon={Clock}
          label="Avg Resolution"
          value={`${stats?.avg_resolution_hours?.toFixed(1) || 0}h`}
          color="text-blue-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved"
          value={stats?.resolved || 0}
          color="text-green-400"
        />
      </div>

      {/* Recent Incidents */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Recent Incidents</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-gray-400">{incident.incident_number}</span>
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                  <h3 className="text-lg font-medium mb-1">{incident.title}</h3>
                  <p className="text-sm text-gray-400">{incident.created_at}</p>
                </div>
                <a
                  href={`/dashboard/incidents/${incident.id}`}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
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

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    SEV1: 'bg-red-900 text-red-300 border-red-500',
    SEV2: 'bg-orange-900 text-orange-300 border-orange-500',
    SEV3: 'bg-yellow-900 text-yellow-300 border-yellow-500',
    SEV4: 'bg-gray-700 text-gray-300 border-gray-500',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[severity as keyof typeof colors]}`}>
      {severity}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    investigating: 'bg-red-900 text-red-300',
    monitoring: 'bg-blue-900 text-blue-300',
    resolved: 'bg-green-900 text-green-300',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}
