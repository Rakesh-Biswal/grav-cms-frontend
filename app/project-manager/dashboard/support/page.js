"use client"

import DashboardLayout from "@/components/DashboardLayout"

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Support Center</h2>
          <p className="text-slate-600">This section is coming soon. Get help and support for the system here.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
