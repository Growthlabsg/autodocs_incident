// app/(dashboard)/incidents/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, User, AlertCircle, CheckCircle, Edit, Trash } from 'lucide-react'
import api from '@/lib/api/client'

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [incident, setIncident] = useState<any>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newUpdate, setNewUpdate] = useState('')

  useEffect(() => {
    fetchIncident()
  }, [params.id])

  const fetchIncident = async () => {
    try {
      const [incidentRes, updatesRes] = await Promise.all([
        api.getIncidents({ id: params.id }),
        api.getIncidentUpdates(params.id as string)
      ])
      setIncident(incidentRes.data.data[0])
      setUpdates(updatesRes.data.data)
    } catch (error) {
      console.error('Failed to fetch incident:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return
    
    try {
      await api.createIncidentUpdate(params.id as string, { message: newUpdate })
      setNewUpdate('')
      fetchIncident()
    } catch (error) {
      console.error('Failed to add update:', error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.updateIncident(params.id as string, { status: newStatus })
      fetchIncident()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Incident not found</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/incidents')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          Back to Incidents
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-gray-400">{incident.incident_number}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-3xl font-bold mb-2">{incident.title}</h1>
            <p className="text-gray-400">
              Created {new Date(incident.created_at).toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              <Edit size={16} />
              Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg">
              <Trash size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-300">{incident.description}</p>
          </div>

          {/* Status Change */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Change Status</h2>
            <div className="flex gap-3">
              {['investigating', 'monitoring', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={incident.status === status}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    incident.status === status
                      ? 'bg-teal-900 text-teal-300 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-700 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{update.first_name} {update.last_name}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(update.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{update.message}</p>
                  </div>
                </div>
              ))}
              
              {/* Creation Event */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">System</span>
                    <span className="text-sm text-gray-400">
                      {new Date(incident.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300">Incident created</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Update */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Add Update</h2>
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Add an update to the timeline..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4"
              rows={4}
            />
            <button
              onClick={handleAddUpdate}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium"
            >
              Post Update
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="font-semibold mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Severity</div>
                <div className="font-medium">{incident.severity}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Status</div>
                <div className="font-medium capitalize">{incident.status}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Service</div>
                <div className="font-medium">{incident.service_name || 'None'}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Created</div>
                <div className="font-medium">
                  {new Date(incident.created_at).toLocaleDateString()}
                </div>
              </div>
              {incident.resolved_at && (
                <div>
                  <div className="text-gray-400 mb-1">Resolved</div>
                  <div className="font-medium">
                    {new Date(incident.resolved_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignees */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="font-semibold mb-4">Assigned To</h3>
            <div className="space-y-2">
              {incident.assignees?.length > 0 ? (
                incident.assignees.map((assignee: any) => (
                  <div key={assignee.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{assignee.first_name} {assignee.last_name}</div>
                      <div className="text-gray-400">{assignee.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No assignees</p>
              )}
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                + Add Assignee
              </button>
            </div>
          </div>
        </div>
      </div>
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
