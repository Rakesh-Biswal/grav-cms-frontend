// /project-manager/dashboard/inventory/operations/purchase-order/page.js
"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Package,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
  MoreVertical
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ReceiptsPage() {
  const router = useRouter()
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    issued: 0,
    partiallyReceived: 0,
    completed: 0,
    totalAmount: 0,
    pendingAmount: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    vendor: "all"
  })
  const [vendors, setVendors] = useState([])
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  })

  // Fetch purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.vendor !== "all") params.append("vendor", filters.vendor)
      if (dateRange.startDate) params.append("startDate", dateRange.startDate)
      if (dateRange.endDate) params.append("endDate", dateRange.endDate)

      const url = `${API_URL}/api/cms/inventory/operations/purchase-orders${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url, {
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        setPurchaseOrders(result.purchaseOrders)
        setStats(result.stats)
      } else {
        toast.error(result.message || "Failed to fetch purchase orders")
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
      toast.error("Failed to fetch purchase orders")
    } finally {
      setLoading(false)
    }
  }

  // Fetch vendors for filter
  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/data/vendors`, {
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        setVendors(result.vendors)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  useEffect(() => {
    fetchPurchaseOrders()
    fetchVendors()
  }, [filters])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleDeletePO = async (id) => {
    if (!confirm("Are you sure you want to delete this purchase order?")) return

    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${id}`, {
        method: "DELETE",
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Purchase order deleted successfully")
        fetchPurchaseOrders()
      } else {
        toast.error(result.message || "Failed to delete purchase order")
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error)
      toast.error("Failed to delete purchase order")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "ISSUED": return "bg-blue-100 text-blue-800"
      case "PARTIALLY_RECEIVED": return "bg-yellow-100 text-yellow-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "DRAFT": return <FileText className="w-4 h-4" />
      case "ISSUED": return <Clock className="w-4 h-4" />
      case "PARTIALLY_RECEIVED": return <AlertCircle className="w-4 h-4" />
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />
      case "CANCELLED": return <XCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateProgress = (po) => {
    if (po.totalReceived === 0) return 0
    const totalOrdered = po.items.reduce((sum, item) => sum + item.quantity, 0)
    return Math.round((po.totalReceived / totalOrdered) * 100)
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600 mt-1">Manage purchase orders and track deliveries</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPurchaseOrders}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Purchase Order
            </Link>
          </div>
        </div>


        {/* Stats Cards - UPDATED VERSION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Orders</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Total Value</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">
                  {formatCurrency(stats.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-amber-800">Pending Payments</div>
                <div className="text-2xl font-semibold text-amber-900 mt-1">
                  {formatCurrency(stats.pendingAmount)}
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  Paid: {formatCurrency(stats.totalPaid || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Payment Status</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">
                  {stats.paymentCompleted || 0} Paid
                </div>
                <div className="text-xs text-purple-700 mt-1">
                  {stats.paymentPartial || 0} Partial, {stats.paymentPending || 0} Pending
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by PO number, vendor, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchPurchaseOrders()}
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
                  <option value="DRAFT">Draft</option>
                  <option value="ISSUED">Issued</option>
                  <option value="PARTIALLY_RECEIVED">Partially Received</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <select
                value={filters.vendor}
                onChange={(e) => handleFilterChange("vendor", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading purchase orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor & Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount & Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map((po) => {
                      const progress = calculateProgress(po)

                      return (
                        <tr key={po._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 font-mono">{po.poNumber}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(po.status)}`}>
                                      {getStatusIcon(po.status)}
                                      {po.status.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                  {po.vendorName || po.vendor?.companyName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {po.vendor?.contactPerson}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  <span>{po.items.length} item{po.items.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="text-xs mt-1">
                                  {po.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="truncate">
                                      {item.itemName} ({item.quantity} {item.unit})
                                    </div>
                                  ))}
                                  {po.items.length > 2 && (
                                    <div className="text-gray-500">+{po.items.length - 2} more</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {po.totalReceived} / {po.items.reduce((sum, item) => sum + item.quantity, 0)} units
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-xs text-gray-600">
                                <div>Received: {po.totalReceived}</div>
                                <div>Pending: {po.totalPending}</div>
                                {po.deliveries.length > 0 && (
                                  <div className="text-gray-500 mt-1">
                                    {po.deliveries.length} delivery{po.deliveries.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatCurrency(po.totalAmount)}
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Order: {formatDate(po.orderDate)}</span>
                                </div>
                                {po.expectedDeliveryDate && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Expected: {formatDate(po.expectedDeliveryDate)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/project-manager/dashboard/inventory/operations/purchase-order/${po._id}`}
                                className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order/${po._id}`}
                                className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              {po.status === "DRAFT" && (
                                <button
                                  onClick={() => handleDeletePO(po._id)}
                                  className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              {po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED" ? (
                                <Link
                                  href={`/project-manager/dashboard/inventory/operations/purchase-order/${po._id}/receive`}
                                  className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50"
                                  title="Receive Delivery"
                                >
                                  <Package className="w-4 h-4" />
                                </Link>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">No purchase orders found. Try different filters or create a new one.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Distribution - UPDATED VERSION */}
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Payment Status Distribution</h3>
            <div className="space-y-2">
              {[
                { label: "Pending", value: stats.paymentPending || 0, color: "bg-red-500" },
                { label: "Partial", value: stats.paymentPartial || 0, color: "bg-yellow-500" },
                { label: "Completed", value: stats.paymentCompleted || 0, color: "bg-green-500" }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color.replace('bg-', '') }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Overview - UPDATED VERSION */}
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Financial Overview</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Total Order Value</div>
                <div className="text-xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Paid</div>
                <div className="text-xl font-semibold text-green-600">{formatCurrency(stats.totalPaid || 0)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pending Payments</div>
                <div className="text-xl font-semibold text-amber-600">{formatCurrency(stats.pendingAmount)}</div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">Payment Completion</div>
                <div className="text-lg font-medium text-gray-900">
                  {stats.totalAmount > 0 ? Math.round(((stats.totalPaid || 0) / stats.totalAmount) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Recent Activities</h3>
            <div className="space-y-3">
              {purchaseOrders.slice(0, 3).map((po) => (
                <div key={po._id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{po.poNumber}</div>
                    <div className="text-xs text-gray-500">{formatDate(po.updatedAt)}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(po.status)}`}>
                    {po.status}
                  </span>
                </div>
              ))}
              {purchaseOrders.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No recent activities</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}