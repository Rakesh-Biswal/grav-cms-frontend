"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Package, Factory, TrendingUp, Users, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { label: "Total Inventory Items", value: "1,234", icon: Package, color: "bg-blue-500" },
    { label: "Active Production Orders", value: "45", icon: Factory, color: "bg-emerald-500" },
    { label: "Completed This Month", value: "156", icon: TrendingUp, color: "bg-purple-500" },
    { label: "Active Users", value: "12", icon: Users, color: "bg-orange-500" },
  ]

  const recentActivity = [
    { id: 1, action: "New inventory item added", item: "Cotton Fabric - Blue", time: "2 hours ago" },
    { id: 2, action: "Production order completed", item: "WO#2024-045", time: "4 hours ago" },
    { id: 3, action: "Stock level alert", item: "Polyester Thread - White", time: "5 hours ago" },
    { id: 4, action: "New production order created", item: "WO#2024-046", time: "6 hours ago" },
  ]
  //project manager view dashboard
  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{activity.action}</p>
                    <p className="text-gray-600 text-sm">{activity.item}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium text-sm">Low Stock Alert</p>
                  <p className="text-gray-600 text-sm">5 items are running low on stock</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium text-sm">Pending Approvals</p>
                  <p className="text-gray-600 text-sm">3 production orders awaiting approval</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium text-sm">System Update</p>
                  <p className="text-gray-600 text-sm">New features available in inventory module</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
