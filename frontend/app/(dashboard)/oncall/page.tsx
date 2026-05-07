// app/(dashboard)/oncall/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Clock, User } from 'lucide-react'
import api from '@/lib/api/client'

export default function OnCallPage() {
  const [currentOncall, setCurrentOncall] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [oncallRes, schedulesRes] = await Promise.all([
        api.getCurrentOnCall(),
        api.getSchedules()
      ])
      setCurrentOncall(oncallRes.data.data)
      setSchedules(schedulesRes.data.data)
    } catch (error) {
      console.error('Failed to fetch on-call data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">On-call Schedule</h1>
        <p className="text-gray-400">Current on-call engineers and schedules</p>
      </div>

      {/* Current On-call */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Currently On-call</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentOncall.map((shift) => (
            <div key={shift.shift_id} className="bg-gray-800 border border-green-500 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-semibold">{shift.first_name} {shift.last_name}</div>
                  <div className="text-sm text-gray-400">{shift.email}</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                <div className="mb-1"><strong>Schedule:</strong> {shift.schedule_name}</div>
                <div className="mb-1"><strong>Until:</strong> {new Date(shift.end_time).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Schedules */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Schedules</h2>
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Timezone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Rotation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium">{schedule.name}</td>
                  <td className="px-6 py-4 text-gray-400">{schedule.timezone}</td>
                  <td className="px-6 py-4 text-gray-400">{schedule.rotation_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      schedule.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
