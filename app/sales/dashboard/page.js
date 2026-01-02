// app/sales/dashboard/page.js

"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/Sales_DashboardLayout"
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  BarChart,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function SalesDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0,
    totalCustomers: 0,
    revenueThisMonth: 0,
    revenueGrowth: 0,
    averageOrderValue: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_URL}/api/cms/sales/overview/dashboard/`, {
        credentials: "include"
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
        }
      }
      
      // Fetch recent requests
      const requestsResponse = await fetch(`${API_URL}/api/cms/sales/overview/requests/recent`, {
        credentials: "include"
      })
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        if (requestsData.success) {
          setRecentRequests(requestsData.requests)
        }
      }
      
      // Fetch top customers
      const customersResponse = await fetch(`${API_URL}/api/cms/sales/overview/customers/top`, {
        credentials: "include"
      })
      
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        if (customersData.success) {
          setTopCustomers(customersData.customers)
        }
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'quotation_sent': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_progress': return <Package className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      case 'quotation_sent': return <FileText className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="sales">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading sales dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="sales">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage customer requests, quotations, and sales performance</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <Clock className="w-4 h-4" />
              Refresh
            </button>
            <Link
              href="/sales/dashboard/reports"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              <BarChart className="w-4 h-4" />
              View Reports
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.totalRequests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`px-2 py-1 rounded-full ${stats.pendingRequests > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {stats.pendingRequests} pending
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (This Month)</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {formatCurrency(stats.revenueThisMonth)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className={`w-4 h-4 ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'} mr-1`} />
              <span className={stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% from last month
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Avg. Order Value: {formatCurrency(stats.averageOrderValue)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {stats.pendingRequests + stats.inProgressRequests}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full mr-2">
                {stats.inProgressRequests} in progress
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Customer Requests</h2>
                  <Link
                    href="/sales/dashboard/customer-requests"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View All →
                  </Link>
                </div>
                <p className="text-sm text-gray-600 mt-1">Latest customer requests requiring attention</p>
              </div>
              
              <div className="p-6">
                {recentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => router.push(`/sales/dashboard/customer-requests/${request._id}`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-700">{request.requestId}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(request.createdAt)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{request.customerInfo.name}</div>
                            <div className="text-sm text-gray-600">{request.customerInfo.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              ₹{request.items.reduce((sum, item) => sum + (item.totalEstimatedPrice || 0), 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {request.items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)} items
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent requests found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Top Customers */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
                <p className="text-sm text-gray-600 mt-1">Most active customers by order value</p>
              </div>
              
              <div className="p-6">
                {topCustomers.length > 0 ? (
                  <div className="space-y-4">
                    {topCustomers.map((customer, index) => (
                      <div key={customer._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-600">{customer.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(customer.totalSpent)}
                          </div>
                          <div className="text-xs text-gray-600">{customer.orderCount} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No customer data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600 mt-1">Frequently used actions</p>
              </div>
              
              <div className="p-6 space-y-3">
                <Link
                  href="/sales/dashboard/customer-requests/new"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Create Quotation</div>
                    <div className="text-sm text-gray-600">Generate new price quotation</div>
                  </div>
                </Link>
                
                <Link
                  href="/sales/dashboard/customers"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Manage Customers</div>
                    <div className="text-sm text-gray-600">View and manage customer database</div>
                  </div>
                </Link>
                
                <Link
                  href="/sales/dashboard/reports"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                    <BarChart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Sales Reports</div>
                    <div className="text-sm text-gray-600">View performance analytics</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}