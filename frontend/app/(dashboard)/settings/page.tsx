// app/(dashboard)/settings/page.tsx
'use client'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store/useStore'
import { Settings as SettingsIcon, User, Bell, Shield, Key } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 rounded-lg border border-gray-700 p-4 h-fit">
          <nav className="space-y-2">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'security', icon: Shield, label: 'Security' },
              { id: 'api', icon: Key, label: 'API Keys' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-900 bg-opacity-30 text-teal-400'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-8">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={user?.firstName}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={user?.lastName}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
                <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email notifications for new incidents', checked: true },
                  { label: 'Slack notifications', checked: true },
                  { label: 'Weekly summary emails', checked: false },
                  { label: 'On-call reminders', checked: true }
                ].map((pref, i) => (
                  <label key={i} className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg cursor-pointer">
                    <input type="checkbox" defaultChecked={pref.checked} className="w-5 h-5" />
                    <span>{pref.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Security</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">API Keys</h2>
              <p className="text-gray-400 mb-6">Manage API keys for programmatic access</p>
              <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium">
                Generate New API Key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
