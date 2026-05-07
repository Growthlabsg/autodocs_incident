// app/(dashboard)/postmortems/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import api from '@/lib/api/client'

export default function PostmortemsPage() {
  const [postmortems, setPostmortems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPostmortems()
  }, [])

  const fetchPostmortems = async () => {
    try {
      const response = await api.getPostmortems()
      setPostmortems(response.data.data)
    } catch (error) {
      console.error('Failed to fetch postmortems:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Post-mortems</h1>
          <p className="text-gray-400">Incident analysis and learnings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">
          <Plus size={20} />
          Create Post-mortem
        </button>
      </div>

      <div className="space-y-4">
        {postmortems.map((pm) => (
          <div key={pm.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-purple-400" size={20} />
                  <h3 className="text-lg font-semibold">{pm.title}</h3>
                </div>
                <p className="text-gray-400 mb-2">{pm.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Incident: {pm.incident_number}</span>
                  <span>•</span>
                  <span>{new Date(pm.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                View Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
