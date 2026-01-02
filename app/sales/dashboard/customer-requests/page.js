// app/sales/dashboard/customer-requests/page.js

"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/Sales_DashboardLayout"
import {
  Search,
  Filter,
  Calendar,
  Eye,
  FileText,
  MessageSquare,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  Download
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function CustomerRequestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    priority: "all"
  })
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    fetchRequests()
  }, [filters])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.dateRange !== "all") params.append("dateRange", filters.dateRange)
      if (filters.priority !== "all") params.append("priority", filters.priority)
      
      const url = `${API_URL}/api/cms/sales/requests${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await fetch(url, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRequests(data.requests)
          setStats(data.stats)
        }
      }
      
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_progress': return <ShoppingBag className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      case 'quotation_sent': return <FileText className="w-4 h-4" />
      default: return null
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/sales/requests/export`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customer-requests-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting:", error)
    }
  }

  return (
    <DashboardLayout activeMenu="sales">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customer Requests</h1>
            <p className="text-gray-600 mt-1">Manage and track all customer clothing requests</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total</div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-800">{stats.pending}</div>
              <div className="text-sm text-yellow-700 mt-1">Pending</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-800">{stats.inProgress}</div>
              <div className="text-sm text-blue-700 mt-1">In Progress</div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-800">{stats.completed}</div>
              <div className="text-sm text-green-700 mt-1">Completed</div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-800">
                {requests.filter(r => r.status === 'quotation_sent').length}
              </div>
              <div className="text-sm text-purple-700 mt-1">Quotation Sent</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by request ID, customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchRequests()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="last_month">Last Month</option>
                </select>
              </div>
              
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading customer requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Summary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Priority</th>
                    <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{request.requestId}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Created: {formatDate(request.createdAt)}
                            </div>
                            {request.customerInfo.deliveryDeadline && (
                              <div className="text-xs text-gray-600 mt-1">
                                Deadline: {formatDate(request.customerInfo.deliveryDeadline)}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.customerInfo.name}</div>
                            <div className="text-xs text-gray-600">{request.customerInfo.email}</div>
                            <div className="text-xs text-gray-600">{request.customerInfo.phone}</div>
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                              {request.customerInfo.city}, {request.customerInfo.postalCode}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(request.items.reduce((sum, item) => sum + (item.totalEstimatedPrice || 0), 0))}
                            </div>
                            <div className="text-xs text-gray-600">
                              {request.items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)} items across {request.items.length} product(s)
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {request.customerInfo.preferredContactMethod === 'phone' ? '📞 Phone' : 
                               request.customerInfo.preferredContactMethod === 'email' ? '📧 Email' : '💬 WhatsApp'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                              {request.priority} priority
                            </span>
                            {request.salesPersonAssigned && (
                              <div className="text-xs text-gray-600">
                                Assigned to: {request.salesPersonAssigned.name}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/sales/dashboard/customer-requests/${request._id}`}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            
                            <Link
                              href={`/sales/dashboard/customer-requests/${request._id}/message`}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">No customer requests found. Try different filters.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {requests.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{requests.length}</span> of{' '}
                  <span className="font-medium">{stats.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}











