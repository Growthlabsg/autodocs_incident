// app/(dashboard)/reports/page.tsx
'use client'
import { useState } from 'react'
import { FileText, Download, Calendar, Filter } from 'lucide-react'

export default function ReportsPage() {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: 'Weekly Incident Summary',
      type: 'summary',
      frequency: 'weekly',
      last_run: '2024-05-01',
      recipients: 3
    },
    {
      id: 2,
      name: 'SLA Compliance Report',
      type: 'sla',
      frequency: 'monthly',
      last_run: '2024-04-30',
      recipients: 5
    },
    {
      id: 3,
      name: 'Team Performance',
      type: 'performance',
      frequency: 'monthly',
      last_run: '2024-04-30',
      recipients: 2
    }
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-gray-400">Custom analytics and insights</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">
          <FileText size={20} />
          Create Report
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <button className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 text-left">
          <Calendar className="text-blue-400 mb-3" size={24} />
          <h3 className="font-semibold mb-1">Daily Summary</h3>
          <p className="text-sm text-gray-400">Get today's incident summary</p>
        </button>
        <button className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 text-left">
          <Filter className="text-green-400 mb-3" size={24} />
          <h3 className="font-semibold mb-1">Custom Query</h3>
          <p className="text-sm text-gray-400">Build a custom report</p>
        </button>
        <button className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 text-left">
          <Download className="text-orange-400 mb-3" size={24} />
          <h3 className="font-semibold mb-1">Export Data</h3>
          <p className="text-sm text-gray-400">Download incidents as CSV</p>
        </button>
      </div>

      {/* Scheduled Reports */}
      <h2 className="text-xl font-semibold mb-4">Scheduled Reports</h2>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{report.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Type: {report.type}</span>
                <span>•</span>
                <span>Frequency: {report.frequency}</span>
                <span>•</span>
                <span>Last run: {report.last_run}</span>
                <span>•</span>
                <span>{report.recipients} recipients</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-teal-900 hover:bg-teal-800 rounded">
                Run Now
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
