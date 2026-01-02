"use client"

import DashboardLayout from "@/components/DashboardLayout"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">System Settings</h2>
          <p className="text-slate-600">This section is coming soon. Configure system preferences and settings here.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
