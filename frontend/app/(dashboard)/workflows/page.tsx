// app/(dashboard)/workflows/page.tsx
'use client'
import { useState } from 'react'
import { Plus, Play, Pause, Edit, Trash, GitBranch } from 'lucide-react'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Auto-assign SEV1 incidents',
      description: 'Automatically assign SEV1 incidents to on-call engineer',
      is_active: true,
      trigger: 'incident_created',
      steps: 4
    },
    {
      id: 2,
      name: 'Escalate after 30 min',
      description: 'Escalate unassigned incidents after 30 minutes',
      is_active: true,
      trigger: 'incident_created',
      steps: 3
    },
    {
      id: 3,
      name: 'Notify Slack on SEV2',
      description: 'Send Slack notification for SEV2+ incidents',
      is_active: false,
      trigger: 'incident_created',
      steps: 2
    }
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Workflows</h1>
          <p className="text-gray-400">Automate incident response</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium">
          <Plus size={20} />
          Create Workflow
        </button>
      </div>

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <GitBranch className="text-teal-400" size={20} />
                  <h3 className="text-lg font-semibold">{workflow.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    workflow.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {workflow.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-400 mb-3">{workflow.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Trigger: {workflow.trigger}</span>
                  <span>•</span>
                  <span>{workflow.steps} steps</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const updated = workflows.map(w =>
                      w.id === workflow.id ? { ...w, is_active: !w.is_active } : w
                    )
                    setWorkflows(updated)
                  }}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  {workflow.is_active ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded">
                  <Edit size={16} />
                </button>
                <button className="p-2 bg-red-900 hover:bg-red-800 rounded">
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
