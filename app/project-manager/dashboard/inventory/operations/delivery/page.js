// /project-manager/dashboard/inventory/operations/delivery/page.js

"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  Package,
  Truck,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  TrendingUp,
  BarChart,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  X,
  ChevronRight,
  DollarSign
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function DeliveryPage() {
  const router = useRouter()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalQuantity: 0,
    totalValue: 0,
    recentDeliveries: 0,
    pendingPOs: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    rawItem: "all",
    vendor: "all",
    dateRange: "all",
    status: "all"
  })
  const [availableFilters, setAvailableFilters] = useState({
    rawItems: [],
    vendors: [],
    purchaseOrders: []
  })
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  })
  const [expandedDelivery, setExpandedDelivery] = useState(null)
  const [showCreateDeliveryModal, setShowCreateDeliveryModal] = useState(false)
  const [pendingPOs, setPendingPOs] = useState([])
  const [selectedPO, setSelectedPO] = useState("")
  const [loadingPOs, setLoadingPOs] = useState(false)

  // Fetch deliveries and filters
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch deliveries
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filters.rawItem !== "all") params.append("rawItem", filters.rawItem)
      if (filters.vendor !== "all") params.append("vendor", filters.vendor)
      if (filters.status !== "all") params.append("status", filters.status)
      if (dateRange.startDate) params.append("startDate", dateRange.startDate)
      if (dateRange.endDate) params.append("endDate", dateRange.endDate)
      
      const deliveriesUrl = `${API_URL}/api/cms/inventory/operations/deliveries${params.toString() ? `?${params.toString()}` : ''}`
      
      const deliveriesResponse = await fetch(deliveriesUrl, {
        credentials: "include"
      })
      
      const deliveriesResult = await deliveriesResponse.json()
      
      if (deliveriesResult.success) {
        setDeliveries(deliveriesResult.deliveries)
        setStats(deliveriesResult.stats)
      } else {
        toast.error(deliveriesResult.message || "Failed to fetch deliveries")
      }
      
      // Fetch filter options
      await fetchFilterOptions()
      
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch deliveries")
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      // Fetch raw items
      const rawItemsResponse = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/data/raw-items`, {
        credentials: "include"
      })
      const rawItemsResult = await rawItemsResponse.json()
      
      if (rawItemsResult.success) {
        setAvailableFilters(prev => ({ ...prev, rawItems: rawItemsResult.rawItems }))
      }
      
      // Fetch vendors
      const vendorsResponse = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/data/vendors`, {
        credentials: "include"
      })
      const vendorsResult = await vendorsResponse.json()
      
      if (vendorsResult.success) {
        setAvailableFilters(prev => ({ ...prev, vendors: vendorsResult.vendors }))
      }
      
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  // Fetch pending purchase orders for the modal
  const fetchPendingPOs = async () => {
    try {
      setLoadingPOs(true)
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/deliveries/data/pending-pos`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPendingPOs(result.purchaseOrders)
      } else {
        toast.error(result.message || "Failed to fetch pending purchase orders")
      }
    } catch (error) {
      console.error("Error fetching pending POs:", error)
      toast.error("Failed to fetch pending purchase orders")
    } finally {
      setLoadingPOs(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const toggleExpandDelivery = (deliveryId) => {
    setExpandedDelivery(expandedDelivery === deliveryId ? null : deliveryId)
  }

  const calculateDeliveryValue = (delivery) => {
    return delivery.items?.reduce((sum, item) => {
      return sum + (item.quantityReceived * item.unitPrice)
    }, 0) || 0
  }

  const getDeliveryStatusColor = (poStatus, delivery) => {
    if (poStatus === "COMPLETED") return "bg-green-100 text-green-800"
    if (poStatus === "PARTIALLY_RECEIVED") return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  // Open create delivery modal
  const handleCreateDelivery = async () => {
    setShowCreateDeliveryModal(true)
    await fetchPendingPOs()
  }

  // Handle PO selection and redirect
  const handleSelectPOAndCreate = () => {
    if (!selectedPO) {
      toast.error("Please select a purchase order")
      return
    }
    
    // Find the selected PO details
    const selectedPODetails = pendingPOs.find(po => po.id === selectedPO)
    if (!selectedPODetails) {
      toast.error("Selected purchase order not found")
      return
    }
    
    // Redirect to the receive delivery page for this PO
    router.push(`/project-manager/dashboard/inventory/operations/purchase-order/${selectedPO}/receive`)
  }

  // Close modal
  const closeModal = () => {
    setShowCreateDeliveryModal(false)
    setSelectedPO("")
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Deliveries</h1>
            <p className="text-gray-600 mt-1">Track and manage raw material deliveries</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleCreateDelivery}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Delivery
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Deliveries</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.totalDeliveries}</div>
                <div className="text-xs text-blue-700 mt-1">
                  {stats.recentDeliveries} this week
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Total Quantity</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">{stats.totalQuantity}</div>
                <div className="text-xs text-green-700 mt-1">
                  units delivered
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Total Value</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">
                  {formatCurrency(stats.totalValue)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-amber-800">Pending POs</div>
                <div className="text-2xl font-semibold text-amber-900 mt-1">{stats.pendingPOs}</div>
                <div className="text-xs text-amber-700 mt-1">
                  awaiting delivery
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
                placeholder="Search by PO number, vendor, item, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchData()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Raw Item</label>
              <select
                value={filters.rawItem}
                onChange={(e) => handleFilterChange("rawItem", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Items</option>
                {availableFilters.rawItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
              <select
                value={filters.vendor}
                onChange={(e) => handleFilterChange("vendor", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vendors</option>
                {availableFilters.vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setFilters({
                  rawItem: "all",
                  vendor: "all",
                  dateRange: "all",
                  status: "all"
                })
                setDateRange({ startDate: "", endDate: "" })
                setSearchTerm("")
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading deliveries...</p>
            </div>
          ) : deliveries.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <div key={delivery._id} className="p-4 hover:bg-gray-50">
                  {/* Delivery Header */}
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpandDelivery(delivery._id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                          <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              PO: {delivery.poNumber}
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDeliveryStatusColor(delivery.purchaseOrder?.status, delivery)}`}>
                              {delivery.purchaseOrder?.status?.replace("_", " ") || "DELIVERED"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Vendor: {delivery.vendorName} • Delivery: {formatDateTime(delivery.deliveryDate)}
                            {delivery.invoiceNumber && ` • Invoice: ${delivery.invoiceNumber}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.totalQuantity} units
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatCurrency(calculateDeliveryValue(delivery))}
                        </div>
                      </div>
                      <div>
                        {expandedDelivery === delivery._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedDelivery === delivery._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Delivery Details */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex">
                              <span className="w-32 text-gray-600">PO Number:</span>
                              <span className="font-medium">{delivery.poNumber}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Vendor:</span>
                              <span className="font-medium">{delivery.vendorName}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Delivery Date:</span>
                              <span className="font-medium">{formatDate(delivery.deliveryDate)}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Invoice Number:</span>
                              <span className="font-medium">{delivery.invoiceNumber || "N/A"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Received By:</span>
                              <span className="font-medium">{delivery.receivedBy?.name || "System"}</span>
                            </div>
                          </div>
                          
                          {delivery.notes && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-600 mb-1">Notes:</div>
                              <div className="text-sm text-gray-800 p-2 bg-gray-50 rounded">{delivery.notes}</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Items Delivered */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Items Delivered</h4>
                          <div className="space-y-2">
                            {delivery.items?.map((item, idx) => (
                              <div key={idx} className="text-sm border border-gray-200 rounded p-2">
                                <div className="font-medium">{item.itemName}</div>
                                <div className="flex justify-between text-xs text-gray-600 mt-1">
                                  <span>Quantity: {item.quantityReceived} {item.unit}</span>
                                  <span>Price: {formatCurrency(item.unitPrice)}/{item.unit}</span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Total: {formatCurrency(item.quantityReceived * item.unitPrice)}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* PO Progress */}
                          {delivery.purchaseOrder && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">PO Progress:</span>
                                <span className="font-medium">
                                  {delivery.purchaseOrder.totalReceived || 0} / {delivery.purchaseOrder.items?.reduce((sum, item) => sum + item.quantity, 0)} units
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    delivery.purchaseOrder.status === "COMPLETED" ? 'bg-green-500' : 
                                    delivery.purchaseOrder.status === "PARTIALLY_RECEIVED" ? 'bg-yellow-500' : 'bg-blue-500'
                                  }`}
                                  style={{
                                    width: `${(delivery.purchaseOrder.totalReceived / delivery.purchaseOrder.items?.reduce((sum, item) => sum + item.quantity, 0)) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                        <Link
                          href={`/project-manager/dashboard/inventory/operations/purchase-order/${delivery.purchaseOrderId}`}
                          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View PO
                        </Link>
                        <Link
                          href={`/project-manager/dashboard/inventory/operations/delivery/${delivery._id}`}
                          className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-500">No deliveries found. Try different filters or create a new delivery.</div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Delivery Trends
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">This Month</div>
                  <div className="text-sm font-medium">12 deliveries</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="w-3/4 h-1.5 bg-blue-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Last Month</div>
                  <div className="text-sm font-medium">18 deliveries</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="w-full h-1.5 bg-blue-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Average Delivery Size</div>
                  <div className="text-sm font-medium">245 units</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Top Vendors
            </h3>
            <div className="space-y-3">
              {Array.from(new Set(deliveries.map(d => d.vendorName))).slice(0, 3).map(vendor => {
                const vendorDeliveries = deliveries.filter(d => d.vendorName === vendor)
                const totalQuantity = vendorDeliveries.reduce((sum, d) => sum + d.totalQuantity, 0)
                const totalValue = vendorDeliveries.reduce((sum, d) => sum + calculateDeliveryValue(d), 0)
                
                return (
                  <div key={vendor} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{vendor}</div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{totalQuantity} units</div>
                      <div className="text-xs text-gray-600">{formatCurrency(totalValue)}</div>
                    </div>
                  </div>
                )
              })}
              {deliveries.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">No delivery data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Delivery Modal */}
      {showCreateDeliveryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Create New Delivery</h3>
                <p className="text-sm text-gray-600 mt-1">Select a purchase order to record delivery against</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              {loadingPOs ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading purchase orders...</p>
                </div>
              ) : pendingPOs.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Purchase Order *
                    </label>
                    <select
                      value={selectedPO}
                      onChange={(e) => setSelectedPO(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a purchase order...</option>
                      {pendingPOs.map(po => {
                        const pendingItems = po.items.filter(item => item.pending > 0).length
                        const totalPending = po.totalPending
                        
                        return (
                          <option key={po.id} value={po.id}>
                            {po.poNumber} - {po.vendorName} ({pendingItems} items, {totalPending} units pending)
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  {/* Selected PO Details Preview */}
                  {selectedPO && (
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Purchase Order Details</h4>
                      {(() => {
                        const selected = pendingPOs.find(po => po.id === selectedPO)
                        if (!selected) return null
                        
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex">
                              <span className="w-32 text-gray-600">PO Number:</span>
                              <span className="font-medium">{selected.poNumber}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Vendor:</span>
                              <span className="font-medium">{selected.vendorName}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Status:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                selected.status === "PARTIALLY_RECEIVED" ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {selected.status.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Items Pending:</span>
                              <span className="font-medium">
                                {selected.items.filter(item => item.pending > 0).length} of {selected.items.length} items
                              </span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-gray-600">Total Pending:</span>
                              <span className="font-medium text-amber-600">{selected.totalPending} units</span>
                            </div>
                            
                            {/* Pending Items List */}
                            <div className="mt-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">Pending Items:</div>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {selected.items
                                  .filter(item => item.pending > 0)
                                  .map((item, idx) => (
                                    <div key={idx} className="text-xs border-l-2 border-amber-200 pl-2 py-1">
                                      <div className="flex justify-between">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-amber-600">{item.pending} {item.unit} pending</span>
                                      </div>
                                      <div className="text-gray-500">
                                        Ordered: {item.ordered} • Received: {item.received} • Pending: {item.pending}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="ml-2">
                        <p className="text-xs text-blue-700">
                          After selecting a purchase order, you will be redirected to the delivery recording page where you can enter received quantities, invoice details, and notes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                  <h4 className="mt-4 text-lg font-medium text-gray-900">No Pending Purchase Orders</h4>
                  <p className="mt-2 text-gray-600">
                    All purchase orders have been completed or there are no orders with pending deliveries.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/project-manager/dashboard/inventory/operations/purchase-order"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={closeModal}
                    >
                      <FileText className="w-4 h-4" />
                      View Purchase Orders
                    </Link>
                    <Link
                      href="/project-manager/dashboard/inventory/operations/purchase-order/new-edit-receipt"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      onClick={closeModal}
                    >
                      <Plus className="w-4 h-4" />
                      Create Purchase Order
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                {pendingPOs.length > 0 && (
                  <button
                    onClick={fetchPendingPOs}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh List
                  </button>
                )}
                <button
                  onClick={handleSelectPOAndCreate}
                  disabled={!selectedPO || loadingPOs}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                  Continue to Create Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}