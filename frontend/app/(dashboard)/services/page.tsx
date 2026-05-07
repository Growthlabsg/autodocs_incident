// app/(dashboard)/services/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Plus, Activity } from 'lucide-react'
import api from '@/lib/api/client'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await api.getServices()
      setServices(response.data.data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Services</h1>
          <p className="text-gray-400">Service catalog and health monitoring</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition-colors">
          <Plus size={20} />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No services found
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="text-teal-400" size={24} />
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                </div>
                <StatusIndicator status={service.status} />
              </div>
              <p className="text-sm text-gray-400 mb-4">{service.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${
                  service.status === 'operational' ? 'text-green-400' :
                  service.status === 'degraded' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {service.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StatusIndicator({ status }: { status: string }) {
  const colors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    outage: 'bg-red-500'
  }
  return (
    <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]}`} />
  )
}
