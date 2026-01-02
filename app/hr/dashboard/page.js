"use client"

import DashboardLayout from "@/components/Hr_DashboardLayout"
import { Users, UserPlus, Clock, Calendar, Award, CreditCard, TrendingUp, AlertCircle } from "lucide-react"

export default function HRDashboardPage() {
  const stats = [
    { label: "Total Employees", value: "147", icon: Users, color: "bg-purple-500", change: "+5 this month" },
    { label: "Active Recruitment", value: "12", icon: UserPlus, color: "bg-blue-500", change: "3 openings" },
    { label: "Today's Attendance", value: "142", icon: Clock, color: "bg-emerald-500", change: "95% present" },
    { label: "Pending Leaves", value: "18", icon: Calendar, color: "bg-orange-500", change: "7 awaiting approval" },
  ]

  const recentActivity = [
    { id: 1, action: "New employee joined", item: "John Doe - Frontend Developer", time: "2 hours ago" },
    { id: 2, action: "Leave application submitted", item: "Alice Smith - 3 days sick leave", time: "4 hours ago" },
    { id: 3, action: "Interview scheduled", item: "Senior Designer position", time: "5 hours ago" },
    { id: 4, action: "Payroll processed", item: "March 2024 salaries", time: "1 day ago" },
    { id: 5, action: "Training completed", item: "15 employees - Leadership Skills", time: "2 days ago" },
    { id : 6, action: "Performance review done", item: "Marketing Team Q1 reviews", time: "3 days ago" },
  ]

  const announcements = [
    { id: 1, title: "Health Insurance Renewal", content: "Renewal forms due by March 31st", type: "info", date: "Mar 15" },
    { id: 2, title: "Hiring Drive", content: "Mass recruitment for production team", type: "hiring", date: "Mar 18" },
    { id: 3, title: "Quarterly Bonus", content: "Performance bonus credited for Q4", type: "bonus", date: "Mar 20" },
    { id: 4, title: "WFH Policy Update", content: "New hybrid work model effective April", type: "policy", date: "Mar 22" },
  ]

  const departmentDistribution = [
    { department: "Production", count: 65, color: "bg-blue-500" },
    { department: "Sales", count: 22, color: "bg-purple-500" },
    { department: "Design", count: 15, color: "bg-emerald-500" },
    { department: "Management", count: 8, color: "bg-orange-500" },
    { department: "Support", count: 12, color: "bg-pink-500" },
    { department: "Other", count: 25, color: "bg-gray-400" },
  ]

  const upcomingEvents = [
    { id: 1, event: "Monthly Town Hall", date: "Mar 25, 2024", time: "3:00 PM" },
    { id: 2, event: "HR Policy Training", date: "Mar 28, 2024", time: "10:00 AM" },
    { id: 3, event: "Performance Review Deadline", date: "Apr 1, 2024", time: "6:00 PM" },
    { id: 4, event: "Salary Disbursement", date: "Apr 5, 2024", time: "-" },
  ]

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">HR Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back, HR Manager! Here's your HR overview for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-green-600 text-xs mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent HR Activities</h2>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                    <p className="text-gray-600 text-sm">{activity.item}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">HR Announcements</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          announcement.type === 'info' ? 'bg-blue-500' :
                          announcement.type === 'hiring' ? 'bg-green-500' :
                          announcement.type === 'bonus' ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}></span>
                        <p className="text-gray-900 font-medium text-sm">{announcement.title}</p>
                      </div>
                      <p className="text-gray-600 text-xs">{announcement.content}</p>
                    </div>
                    <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">
                      {announcement.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Distribution by Department</h2>
            <div className="space-y-3">
              {departmentDistribution.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${dept.color} rounded-full`}></div>
                    <span className="text-sm text-gray-700">{dept.department}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${dept.color} rounded-full`}
                        style={{ width: `${(dept.count / 147) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Employees</span>
                <span className="font-semibold text-gray-900">147</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events & Alerts */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming HR Events</h2>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{event.event}</p>
                      <p className="text-gray-500 text-xs">{event.date} {event.time !== '-' && `• ${event.time}`}</p>
                    </div>
                    <AlertCircle className="w-4 h-4 text-purple-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick HR Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">87%</p>
                  <p className="text-xs text-gray-600 mt-1">Employee Satisfaction</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">94%</p>
                  <p className="text-xs text-gray-600 mt-1">Attendance Rate</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-700">15</p>
                  <p className="text-xs text-gray-600 mt-1">New Hires (MTD)</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">3.2%</p>
                  <p className="text-xs text-gray-600 mt-1">Attrition Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">HR Alerts & Notifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium text-sm">Documentation Pending</p>
                <p className="text-gray-600 text-xs">5 employees missing documents</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium text-sm">Leave Approvals</p>
                <p className="text-gray-600 text-xs">7 leave requests pending</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium text-sm">Payroll Due</p>
                <p className="text-gray-600 text-xs">Process in 5 working days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium text-sm">Training Schedule</p>
                <p className="text-gray-600 text-xs">New hire training tomorrow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}