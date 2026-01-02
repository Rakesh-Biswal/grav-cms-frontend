"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Tag,
  Layers,
  Filter,
  BarChart,
  AlertCircle,
  Eye,
  ShoppingCart,
  Users,
  Percent,
  RefreshCw,
  FileText
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function RawItemsPage() {
  const [rawItems, setRawItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalCostValue: 0,
    totalSellingValue: 0
  })
  const [filters, setFilters] = useState({
    status: "all",
    category: "all"
  })
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    statuses: []
  })

  // Fetch raw items from backend
  const fetchRawItems = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.category !== "all") params.append("category", filters.category)

      const url = `${API_URL}/api/cms/raw-items${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url, {
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        setRawItems(result.rawItems)
        setStats(result.stats)
        setAvailableFilters(result.filters)
      } else {
        toast.error(result.message || "Failed to fetch raw items")
      }
    } catch (error) {
      console.error("Error fetching raw items:", error)
      toast.error("Failed to fetch raw items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRawItems()
  }, [filters])

  // Handle delete raw item
  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this raw material?")) return

    try {
      const response = await fetch(`${API_URL}/api/cms/raw-items/${id}`, {
        method: "DELETE",
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Raw item deleted successfully")
        fetchRawItems()
      } else {
        toast.error(result.message || "Failed to delete raw item")
      }
    } catch (error) {
      console.error("Error deleting raw item:", error)
      toast.error("Failed to delete raw item")
    }
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Get recent vendor cost from transactions
  const getRecentVendorCost = (item) => {
    if (!item.stockTransactions || item.stockTransactions.length === 0) return 0

    // Get the most recent ADD or PURCHASE_ORDER transaction
    const recentTransaction = item.stockTransactions
      .filter(tx => tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

    return recentTransaction?.unitPrice || 0
  }

  // Get primary vendor from transactions
  const getPrimaryVendor = (item) => {
    if (!item.stockTransactions || item.stockTransactions.length === 0) return "No purchases yet"

    // Find the most frequent supplier
    const supplierCount = {}
    item.stockTransactions
      .filter(tx => tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
      .forEach(tx => {
        if (tx.supplier) {
          supplierCount[tx.supplier] = (supplierCount[tx.supplier] || 0) + 1
        }
      })

    const vendors = Object.entries(supplierCount)
    if (vendors.length === 0) return "No purchases yet"

    return vendors.sort((a, b) => b[1] - a[1])[0][0]
  }

  // Get number of vendors from transactions
  const getVendorCount = (item) => {
    if (!item.stockTransactions || item.stockTransactions.length === 0) return 0

    const uniqueVendors = new Set()
    item.stockTransactions
      .filter(tx => tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
      .forEach(tx => {
        if (tx.supplier) uniqueVendors.add(tx.supplier)
      })

    return uniqueVendors.size
  }

  // Calculate discount percentage
  const getDiscountPercentage = (item) => {
    if (!item.sellingPrice || item.sellingPrice <= 0 || !item.discounts || item.discounts.length === 0) return 0
    const lowestDiscountPrice = Math.min(...item.discounts.map(d => d.price))
    const discount = item.sellingPrice - lowestDiscountPrice
    return Math.round((discount / item.sellingPrice) * 100)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800"
      case "Low Stock": return "bg-yellow-100 text-yellow-800"
      case "Out of Stock": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStockPercentage = (item) => {
    const percentage = (item.quantity / item.maxStock) * 100
    if (percentage > 100) return 100
    if (percentage < 0) return 0
    return percentage
  }

  const getStockColor = (item) => {
    const percentage = getStockPercentage(item)
    if (percentage < 25) return "bg-red-500"
    if (percentage < 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  // Get total unique vendors from all items
  const getAllVendors = () => {
    const vendorSet = new Set()
    rawItems.forEach(item => {
      if (item.stockTransactions) {
        item.stockTransactions
          .filter(tx => tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
          .forEach(tx => {
            if (tx.supplier) vendorSet.add(tx.supplier)
          })
      }
    })
    return Array.from(vendorSet)
  }

  // Navigate to create purchase order
  const navigateToCreatePO = (itemId) => {
    router.push(`/project-manager/dashboard/inventory/vendors-buyer/vendors/create-po?rawItemId=${itemId}`)
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Raw Materials</h1>
            <p className="text-gray-600 mt-1">Manage raw materials inventory for clothing production</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRawItems}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/project-manager/dashboard/inventory/products/raw-items/add-edit-raw-item"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Register New Raw Material
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Raw Materials</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <BarChart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Inventory Value</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">
                  ₹{stats.totalSellingValue.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Based on selling price
                </div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Stock Alerts</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">{stats.lowStock + stats.outOfStock}</div>
                <div className="text-xs text-purple-700 mt-1">
                  {stats.outOfStock} Out, {stats.lowStock} Low
                </div>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-amber-800">Active Vendors</div>
                <div className="text-2xl font-semibold text-amber-900 mt-1">{getAllVendors().length}</div>
                <div className="text-xs text-amber-700 mt-1">
                  From purchase orders
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
                placeholder="Search by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchRawItems()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {availableFilters.categories?.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Raw Materials Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading raw materials...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category & Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor & Pricing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rawItems.length > 0 ? (
                    rawItems.map((item) => {
                      const recentCost = getRecentVendorCost(item)
                      const primaryVendor = getPrimaryVendor(item)
                      const vendorCount = getVendorCount(item)
                      const discountPercentage = getDiscountPercentage(item)
                      const itemUnit = item.customUnit || item.unit

                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                  <Layers className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-xs text-gray-500 font-mono">{item.sku}</div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600">
                                {item.description ? (
                                  <div className="truncate max-w-xs">{item.description}</div>
                                ) : (
                                  <div className="text-gray-400">No description</div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Updated: {formatDate(item.updatedAt)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {item.customCategory || item.category}
                              </span>
                              <div className="text-sm font-medium text-gray-900">
                                Unit: <span className="font-mono">{itemUnit}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                Min: {item.minStock} | Max: {item.maxStock}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.quantity.toLocaleString()} {itemUnit}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className={`h-2 rounded-full ${getStockColor(item)}`}
                                    style={{ width: `${getStockPercentage(item)}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                                {item.quantity <= item.minStock && (
                                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                                )}
                                {item.quantity === 0 && (
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              {/* Vendor Information */}
                              <div className="flex items-start gap-2">
                                <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                    {primaryVendor}
                                  </div>
                                  {vendorCount > 0 && (
                                    <div className="text-xs text-gray-600">
                                      {vendorCount} vendor{vendorCount !== 1 ? 's' : ''} total
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Pricing Information */}
                              <div>

                                {item.sellingPrice && (
                                  <div className="text-sm font-medium text-green-900">
                                    Selling: ₹{item.sellingPrice.toLocaleString('en-IN')} / {itemUnit}
                                  </div>
                                )}
                              </div>


                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/project-manager/dashboard/inventory/products/raw-items/raw-items-view/${item._id}`}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md"
                                  title="View Details"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </Link>
                                <Link
                                  href={`/project-manager/dashboard/inventory/products/raw-items/add-edit-raw-item/${item._id}`}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md"
                                  title="Edit"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </Link>
                                
                              </div>
                              <div className="flex items-center gap-2">

                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">No raw materials found. Try different filters or add a new item.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vendor Overview */}
        {getAllVendors().length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Vendor Overview (From Purchase Orders)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getAllVendors().slice(0, 8).map(vendor => {
                const vendorItems = rawItems.filter(item =>
                  item.stockTransactions?.some(tx =>
                    tx.supplier === vendor && (tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
                  )
                ).length

                const totalPurchased = rawItems.reduce((sum, item) => {
                  const vendorTransactions = item.stockTransactions?.filter(tx =>
                    tx.supplier === vendor && (tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
                  ) || []

                  const vendorQty = vendorTransactions.reduce((qtySum, tx) => qtySum + (tx.quantity || 0), 0)
                  const vendorCost = vendorTransactions.length > 0 ?
                    vendorTransactions[0].unitPrice || 0 : 0

                  return sum + (vendorQty * vendorCost)
                }, 0)

                return (
                  <div key={vendor} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="text-sm font-medium text-gray-900 truncate">{vendor}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-600">{vendorItems} item{vendorItems !== 1 ? 's' : ''}</div>
                      <div className="text-xs font-medium text-blue-600">
                        ₹{totalPurchased.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )
              })}
              {getAllVendors().length > 8 && (
                <div className="bg-white p-3 rounded-md border border-gray-200 flex items-center justify-center">
                  <div className="text-sm text-gray-600">
                    +{getAllVendors().length - 8} more vendors
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Out of Stock Items</h3>
                <div className="mt-1 text-sm text-red-700">
                  {stats.outOfStock > 0 ? (
                    <div>
                      <p className="font-medium">{stats.outOfStock} items need immediate attention</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rawItems
                          .filter(item => item.quantity === 0)
                          .slice(0, 5)
                          .map(item => (
                            <span key={item._id} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              {item.name}
                            </span>
                          ))}
                        {stats.outOfStock > 5 && (
                          <span className="px-2 py-1 text-xs text-red-600">
                            +{stats.outOfStock - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>No items are currently out of stock. Great job!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Low Stock Items</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  {stats.lowStock > 0 ? (
                    <div>
                      <p className="font-medium">{stats.lowStock} items below minimum stock</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rawItems
                          .filter(item => item.quantity > 0 && item.quantity <= item.minStock)
                          .slice(0, 5)
                          .map(item => (
                            <span key={item._id} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              {item.name} ({item.quantity}/{item.minStock})
                            </span>
                          ))}
                        {stats.lowStock > 5 && (
                          <span className="px-2 py-1 text-xs text-yellow-600">
                            +{stats.lowStock - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>All items are above minimum stock levels.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/project-manager/dashboard/inventory/vendors-buyer/vendors"
              className="px-3 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Vendors
            </Link>
            <Link
              href="/project-manager/dashboard/inventory/vendors-buyer/vendors/create-po"
              className="px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Create Purchase Order
            </Link>
            <Link
              href="/project-manager/dashboard/inventory/products/raw-items/reports"
              className="px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md flex items-center gap-2"
            >
              <BarChart className="w-4 h-4" />
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}