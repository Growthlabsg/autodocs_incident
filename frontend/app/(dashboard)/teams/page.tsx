// app/(dashboard)/teams/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Users, Plus } from 'lucide-react'
import api from '@/lib/api/client'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await api.getTeams()
      setTeams(response.data.data)
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teams</h1>
          <p className="text-gray-400">Manage teams and members</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium">
          <Plus size={20} />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                  <p className="text-sm text-gray-400">{team.description}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Created {new Date(team.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
