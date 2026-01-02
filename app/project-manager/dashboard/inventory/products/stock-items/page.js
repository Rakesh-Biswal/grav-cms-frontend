// /project-manager/dashboard/inventory/products/stock-items/page.js

"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ShoppingBag, 
  Tag, 
  Eye,
  Filter,
  TrendingUp,
  Package,
  AlertCircle,
  BarChart3,
  RefreshCw
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Categories for finished clothing products
const categories = [
  "T-Shirts",
  "Shirts",
  "Jeans",
  "Bottoms",
  "Ethnic Wear",
  "Kids Wear",
  "Sportswear",
  "Sweatshirts",
  "Outerwear",
  "Accessories",
  "Innerwear",
  "Formal Wear"
]

export default function StockItemsPage() {
  const router = useRouter()
  const [stockItems, setStockItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalInventoryValue: 0,
    totalPotentialRevenue: 0,
    averageMargin: 0
  })
  const [availableCategories, setAvailableCategories] = useState([])

  // Fetch stock items from backend
  const fetchStockItems = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)
      
      const url = `${API_URL}/api/cms/stock-items${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await fetch(url, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStockItems(result.stockItems)
        setStats(result.stats)
        setAvailableCategories(result.filters?.categories || categories)
      } else {
        toast.error(result.message || "Failed to fetch stock items")
      }
    } catch (error) {
      console.error("Error fetching stock items:", error)
      toast.error("Failed to fetch stock items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStockItems()
  }, [categoryFilter, statusFilter])

  // Handle delete stock item
  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this stock item?")) return
    
    try {
      const response = await fetch(`${API_URL}/api/cms/stock-items/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Stock item deleted successfully")
        fetchStockItems()
      } else {
        toast.error(result.message || "Failed to delete stock item")
      }
    } catch (error) {
      console.error("Error deleting stock item:", error)
      toast.error("Failed to delete stock item")
    }
  }

  // Handle add stock
  const handleAddStock = (id) => {
    // Redirect to add stock page
    router.push(`/project-manager/dashboard/inventory/products/stock-items/add-stock/${id}`)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "In Stock": return "bg-green-100 text-green-800"
      case "Low Stock": return "bg-yellow-100 text-yellow-800"
      case "Out of Stock": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStockPercentage = (item) => {
    const percentage = (item.quantityOnHand / item.maxStock) * 100
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

  const getProfitMargin = (item) => {
    return item.profitMargin || 0
  }

  const getMarginColor = (margin) => {
    if (margin >= 50) return "text-green-600"
    if (margin >= 25) return "text-yellow-600"
    return "text-red-600"
  }

  const getImageUrl = (images) => {
    if (images && images.length > 0) {
      return images[0]
    }
    return null
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Stocks / Registered Items</h1>
            <p className="text-gray-600 mt-1">Manage finished clothing products and inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStockItems}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/project-manager/dashboard/inventory/products/stock-items/new-stock-item"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Stock Item
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Products</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Inventory Value</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">
                  ₹{stats.totalInventoryValue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Avg. Margin</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">
                  {stats.averageMargin.toFixed(1)}%
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
                <div className="text-sm font-medium text-amber-800">Low/Out of Stock</div>
                <div className="text-2xl font-semibold text-amber-900 mt-1">
                  {stats.lowStock + stats.outOfStock}
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
                placeholder="Search by name, reference, HSN code, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchStockItems()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

        {/* Stock Items Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading stock items...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category & Inventory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Levels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing & Components
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockItems.length > 0 ? (
                    stockItems.map((item) => {
                      const imageUrl = getImageUrl(item.images)
                      const rawItemsCount = item.rawItems?.length || 0
                      const operationsCount = item.operations?.length || 0
                      
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                {imageUrl ? (
                                  <div className="w-8 h-8 rounded-md overflow-hidden">
                                    <img
                                      src={imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-xs text-gray-500 font-mono">{item.reference}</div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600">
                                <span className="font-medium">HSN:</span> {item.hsnCode || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.barcode && `Barcode: ${item.barcode}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                {item.category}
                              </span>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Unit:</span> {item.unit}
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Cost/Unit:</span> ₹{item.cost?.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-900">
                                {item.quantityOnHand.toLocaleString()} {item.unit}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getStockColor(item)}`}
                                  style={{ width: `${getStockPercentage(item)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Min: {item.minStock}</span>
                                <span>Max: {item.maxStock}</span>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-900">
                                Cost: ₹{item.cost?.toLocaleString('en-IN')}
                              </div>
                              <div className="text-sm font-bold text-green-700">
                                Price: ₹{item.salesPrice?.toLocaleString('en-IN')}
                              </div>
                              <div className={`text-xs font-medium ${getMarginColor(getProfitMargin(item))}`}>
                                Margin: {getProfitMargin(item).toFixed(1)}%
                              </div>
                              <div className="flex gap-3 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  <span>{rawItemsCount} raw items</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  <span>{operationsCount} operations</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/project-manager/dashboard/inventory/products/stock-items/stock-item-view/${item._id}`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/project-manager/dashboard/inventory/products/stock-items/new-stock-item/${item._id}`}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">No stock items found. Try a different search or add a new item.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-xs text-blue-600">Total Cost Value</div>
              <div className="text-lg font-semibold text-blue-800 mt-1">
                ₹{stats.totalInventoryValue.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-xs text-green-600">Potential Revenue</div>
              <div className="text-lg font-semibold text-green-800 mt-1">
                ₹{stats.totalPotentialRevenue.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-md">
              <div className="text-xs text-purple-600">Total Potential Profit</div>
              <div className="text-lg font-semibold text-purple-800 mt-1">
                ₹{(stats.totalPotentialRevenue - stats.totalInventoryValue).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-amber-50 p-3 rounded-md">
              <div className="text-xs text-amber-600">Avg. Profit Margin</div>
              <div className="text-lg font-semibold text-amber-800 mt-1">
                {stats.averageMargin.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Package className="w-5 h-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Out of Stock Items ({stats.outOfStock})</h3>
                <div className="mt-1 text-sm text-red-700">
                  {stats.outOfStock > 0 ? (
                    <ul className="list-disc pl-5">
                      {stockItems
                        .filter(item => item.status === "Out of Stock")
                        .slice(0, 3)
                        .map(item => (
                          <li key={item._id} className="truncate">{item.name}</li>
                        ))}
                      {stats.outOfStock > 3 && (
                        <li className="text-gray-600">and {stats.outOfStock - 3} more...</li>
                      )}
                    </ul>
                  ) : (
                    <p>All items are in stock.</p>
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
                <h3 className="text-sm font-medium text-yellow-800">Low Stock Items ({stats.lowStock})</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  {stats.lowStock > 0 ? (
                    <ul className="list-disc pl-5">
                      {stockItems
                        .filter(item => item.status === "Low Stock")
                        .slice(0, 3)
                        .map(item => (
                          <li key={item._id} className="truncate">{item.name}</li>
                        ))}
                      {stats.lowStock > 3 && (
                        <li className="text-gray-600">and {stats.lowStock - 3} more...</li>
                      )}
                    </ul>
                  ) : (
                    <p>No low stock items.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Category Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map(category => {
              const itemsInCategory = stockItems.filter(item => item.category === category)
              const count = itemsInCategory.length
              const inventoryValue = itemsInCategory.reduce((sum, item) => sum + (item.inventoryValue || 0), 0)
              
              return count > 0 ? (
                <div key={category} className="bg-white p-3 rounded-md border border-gray-200">
                  <div className="text-xs text-gray-500 truncate">{category}</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{count}</div>
                  <div className="text-xs text-gray-600 mt-1 truncate">
                    ₹{inventoryValue.toLocaleString('en-IN')}
                  </div>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}