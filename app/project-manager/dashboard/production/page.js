"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useState } from "react"
import { ChevronDown, FileText, Calendar, Users, Package, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProductionPage() {
  const [filters, setFilters] = useState({ 
    status: "all", 
    priority: "all", 
    search: "",
    clothType: "all",
    dateRange: "all"
  })
  const [openDropdown, setOpenDropdown] = useState(null)
  const router = useRouter()

  const dropdownMenus = {
    tenders: [
      { name: "Register New Tender", action: () => router.push("/project-manager/dashboard/production/new-tender") },
      { name: "View Active Tenders", action: () => router.push("/project-manager/dashboard/production/tenders/active") },
      { name: "View Completed Tenders", action: () => router.push("/project-manager/dashboard/production/tenders/completed") },
      { name: "Tender Archive", action: () => router.push("/project-manager/dashboard/production/tenders/archive") },
    ],
    
    configurations: [
      { name: "Cloth Types & Categories", action: () => router.push("/project-manager/dashboard/production/configurations/cloth-types") },
      { name: "Size Charts", action: () => router.push("/project-manager/dashboard/production/configurations/size-charts") },
      { name: "Color Library", action: () => router.push("/project-manager/dashboard/production/configurations/colors") },
      { name: "Production Lines", action: () => router.push("/project-manager/dashboard/production/configurations/production-lines") },
      { name: "Customer Management", action: () => router.push("/project-manager/dashboard/production/configurations/customers") },
    ],
  }

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  // Production statistics data
  const productionStats = [
    {
      title: "Active Tenders",
      value: "24",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      change: "+12%",
      color: "bg-blue-50 text-blue-700",
      description: "Customer requirements in progress"
    },
    {
      title: "Production Orders",
      value: "18",
      icon: <Package className="h-6 w-6 text-green-600" />,
      change: "+5%",
      color: "bg-green-50 text-green-700",
      description: "Orders in production"
    },
    {
      title: "Pending Approval",
      value: "8",
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      change: "-2%",
      color: "bg-yellow-50 text-yellow-700",
      description: "Awaiting confirmation"
    },
    {
      title: "Completed This Month",
      value: "42",
      icon: <CheckCircle className="h-6 w-6 text-purple-600" />,
      change: "+18%",
      color: "bg-purple-50 text-purple-700",
      description: "Successfully delivered"
    }
  ]

  // Quick actions
  const quickActions = [
    {
      title: "Register New Tender",
      description: "Add customer clothing requirements",
      icon: <FileText className="h-5 w-5" />,
      action: () => router.push("/project-manager/dashboard/production/tenders/register"),
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200"
    },
    {
      title: "View Schedule",
      description: "Check production timeline",
      icon: <Calendar className="h-5 w-5" />,
      action: () => router.push("/project-manager/dashboard/production/schedule"),
      color: "bg-green-100 text-green-700 hover:bg-green-200"
    },
    {
      title: "Material Check",
      description: "Verify fabric and materials",
      icon: <Package className="h-5 w-5" />,
      action: () => router.push("/project-manager/dashboard/production/materials/requirements"),
      color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
    },
    {
      title: "Team Allocation",
      description: "Assign workers to orders",
      icon: <Users className="h-5 w-5" />,
      action: () => router.push("/project-manager/dashboard/production/configurations/teams"),
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200"
    }
  ]

  // Recent activities
  const recentActivities = [
    { id: 1, description: "New tender registered for Cotton Shirts", time: "10 minutes ago", status: "new" },
    { id: 2, description: "Denim Jeans production started", time: "2 hours ago", status: "in-progress" },
    { id: 3, description: "Silk Saree order completed", time: "1 day ago", status: "completed" },
    { id: 4, description: "Material shortage for Wool Jackets", time: "2 days ago", status: "alert" },
    { id: 5, description: "New customer added - Fashion Trends Inc.", time: "3 days ago", status: "new" }
  ]

  return (
    <DashboardLayout activeMenu="production">
      <div className="space-y-6">
        {/* Header with dropdown buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Production & Tender Management</h1>
            <p className="text-gray-600 mt-1">Manage customer requirements, tenders, and production planning</p>
          </div>

          {/* Dropdown buttons */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(dropdownMenus).map((menuKey) => (
              <div key={menuKey} className="relative">
                <button
                  onClick={() => handleDropdownToggle(menuKey)}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 capitalize"
                >
                  {menuKey}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {openDropdown === menuKey && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {dropdownMenus[menuKey].map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 first:rounded-t-md last:rounded-b-md"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Production Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {productionStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color.split(' ')[0]}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${action.color}`}
              >
                <div className="mb-3">
                  {action.icon}
                </div>
                <h3 className="font-medium text-center">{action.title}</h3>
                <p className="text-sm text-center mt-1 opacity-80">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <button 
                onClick={() => router.push("/project-manager/dashboard/production/activities")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full mr-3 ${
                    activity.status === 'new' ? 'bg-blue-100' :
                    activity.status === 'in-progress' ? 'bg-yellow-100' :
                    activity.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {activity.status === 'alert' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{activity.description}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters & Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Tenders</h2>
            
            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Tenders</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search by customer, cloth type, or ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="in-production">In Production</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Cloth Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cloth Type</label>
              <select
                value={filters.clothType}
                onChange={(e) => setFilters({...filters, clothType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="cotton">Cotton</option>
                <option value="denim">Denim</option>
                <option value="silk">Silk</option>
                <option value="wool">Wool</option>
                <option value="polyester">Polyester</option>
                <option value="linen">Linen</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => router.push("/project-manager/dashboard/production/tenders/register")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Register New Tender
              </button>
              <button
                onClick={() => router.push("/project-manager/dashboard/production/tenders/active")}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                View Active Tenders
              </button>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-800">Production Management Guidelines</h3>
              <div className="mt-2 text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Register customer requirements with complete details (cloth type, size, color, quantity)</li>
                  <li>Check material availability before accepting tenders</li>
                  <li>Allocate production lines based on order priority</li>
                  <li>Update tender status at each production stage</li>
                  <li>Maintain quality control records for each batch</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}