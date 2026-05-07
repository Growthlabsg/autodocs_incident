// app/(dashboard)/status/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Globe, Plus } from 'lucide-react'
import api from '@/lib/api/client'

export default function StatusPagesPage() {
  const [statusPages, setStatusPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatusPages()
  }, [])

  const fetchStatusPages = async () => {
    try {
      const response = await api.getStatusPages()
      setStatusPages(response.data.data)
    } catch (error) {
      console.error('Failed to fetch status pages:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Status Pages</h1>
          <p className="text-gray-400">Public status pages for your services</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
          <Plus size={20} />
          Create Status Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statusPages.map((page) => (
          <div key={page.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="text-blue-400" size={24} />
                <div>
                  <h3 className="text-lg font-semibold">{page.name}</h3>
                  <p className="text-sm text-blue-400">{page.subdomain}.status.com</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                page.is_public ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
              }`}>
                {page.is_public ? 'Public' : 'Private'}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                Configure
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-900 hover:bg-blue-800 rounded text-sm">
                View Page
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
