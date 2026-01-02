// /project-manager/dashboard/inventory/page.js

"use client"

import DashboardLayout from "@/components/DashboardLayout"
import InventoryStats from "./components/InventoryStats"
import InventoryFilters from "./components/InventoryFilters"
import InventoryTable from "./components/InventoryTable"
import { useState, useEffect } from "react"
import { ChevronDown, RefreshCw, Package, ShoppingCart, Users, DollarSign, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function InventoryPage() {
  const [filters, setFilters] = useState({ category: "all", status: "all", search: "" })
  const [openDropdown, setOpenDropdown] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentActivities, setRecentActivities] = useState(null)
  const [criticalItems, setCriticalItems] = useState(null)
  const router = useRouter()

  const dropdownMenus = {
    products: [
      { name: "Raw Items / Materials", action: () => router.push("/project-manager/dashboard/inventory/products/raw-items") },
      { name: "Stock Items / BOM", action: () => router.push("/project-manager/dashboard/inventory/products/stock-items") },
    ],
    configurations: [
      { name: "Warehouse Management", action: () => router.push("/project-manager/dashboard/inventory/configurations/warehouse") },
      { name: "Workers / Employees", action: () => router.push("/project-manager/dashboard/inventory/configurations/assigned-team") },
      { name: "Devices / Machines", action: () => router.push("/project-manager/dashboard/inventory/configurations/devices-machines") },
      { name: "Units & Packaging", action: () => router.push("/project-manager/dashboard/inventory/configurations/units-packaging") },
    ],
    operations: [
      { name: "Purchase Order", action: () => router.push("/project-manager/dashboard/inventory/operations/purchase-order") },
      { name: "Raw-Item Delivery", action: () => router.push("/project-manager/dashboard/inventory/operations/delivery") },
    ],
    reporting: [
      { name: "Vendor / Supplier's", action: () => router.push("/project-manager/dashboard/inventory/vendors-buyer/vendors") },
    ],
  }

  const fetchInventoryOverview = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/inventory/overview`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStats(result.stats)
        setRecentActivities(result.recentActivities)
        setCriticalItems(result.criticalItems)
      } else {
        toast.error(result.message || "Failed to fetch inventory data")
      }
    } catch (error) {
      console.error("Error fetching inventory overview:", error)
      toast.error("Failed to fetch inventory data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryOverview()
  }, [])

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
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
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading && !stats) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading inventory data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header with dropdown buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all your inventory items</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchInventoryOverview}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {/* Operations Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle("operations")}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Operations
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {openDropdown === "operations" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {dropdownMenus.operations.map((item, index) => (
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

            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle("products")}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Products
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {openDropdown === "products" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {dropdownMenus.products.map((item, index) => (
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

            {/* Reporting Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle("reporting")}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Vendor-Buyer
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {openDropdown === "reporting" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {dropdownMenus.reporting.map((item, index) => (
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

            {/* Configurations Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle("configurations")}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Configurations
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {openDropdown === "configurations" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {dropdownMenus.configurations.map((item, index) => (
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
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Inventory Value */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-800">Total Inventory Value</div>
                  <div className="text-2xl font-semibold text-blue-900 mt-1">
                    {formatCurrency(stats.overall.totalValue)}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {stats.overall.totalItems} items
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Raw Items */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-800">Raw Items</div>
                  <div className="text-2xl font-semibold text-green-900 mt-1">
                    {stats.rawItems.total}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    {stats.rawItems.totalQuantity} units • {formatCurrency(stats.rawItems.totalValue)}
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Stock Items */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-800">Stock Items</div>
                  <div className="text-2xl font-semibold text-purple-900 mt-1">
                    {stats.stockItems.total}
                  </div>
                  <div className="text-xs text-purple-700 mt-1">
                    {stats.stockItems.totalQuantity} units • {formatCurrency(stats.stockItems.totalValue)}
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Purchase Orders */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-amber-800">Purchase Orders</div>
                  <div className="text-2xl font-semibold text-amber-900 mt-1">
                    {stats.purchaseOrders.total}
                  </div>
                  <div className="text-xs text-amber-700 mt-1">
                    {formatCurrency(stats.purchaseOrders.totalValue)} total
                  </div>
                </div>
                <div className="w-12 h-12 bg-amber-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Overview Grid */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Status</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">Raw Items</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">{stats.rawItems.inStock} In Stock</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-yellow-600">{stats.rawItems.lowStock} Low</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-red-600">{stats.rawItems.outOfStock} Out</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(stats.rawItems.inStock / stats.rawItems.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">Stock Items</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">{stats.stockItems.inStock} In Stock</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-yellow-600">{stats.stockItems.lowStock} Low</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-red-600">{stats.stockItems.outOfStock} Out</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(stats.stockItems.inStock / stats.stockItems.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Stock Alerts</div>
                  <div className="space-y-2">
                    {criticalItems?.rawItems?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
                        <div className="text-sm text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-red-600 font-medium">
                          {item.quantity}/{item.minStock}
                        </div>
                      </div>
                    ))}
                    {criticalItems?.rawItems?.length === 0 && criticalItems?.stockItems?.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-2">No critical stock alerts</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Order Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase Orders</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">Order Status</div>
                    <div className="text-sm text-gray-600">
                      {stats.purchaseOrders.total} total
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm text-blue-700">Draft</div>
                      <div className="text-xl font-semibold text-blue-900">{stats.purchaseOrders.draft}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md">
                      <div className="text-sm text-green-700">Completed</div>
                      <div className="text-xl font-semibold text-green-900">{stats.purchaseOrders.completed}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <div className="text-sm text-yellow-700">Issued</div>
                      <div className="text-xl font-semibold text-yellow-900">{stats.purchaseOrders.issued}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-md">
                      <div className="text-sm text-red-700">Cancelled</div>
                      <div className="text-xl font-semibold text-red-900">{stats.purchaseOrders.cancelled}</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">Financial Overview</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(stats.purchaseOrders.totalValue)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Orders</span>
                      <span className="text-sm font-medium text-amber-600">
                        {formatCurrency(stats.purchaseOrders.pendingValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Units Received</span>
                      <span className="text-sm font-medium text-green-600">
                        {stats.purchaseOrders.totalReceived}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Units Pending</span>
                      <span className="text-sm font-medium text-red-600">
                        {stats.purchaseOrders.totalPending}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Recent Raw Items</div>
                  <div className="space-y-3">
                    {recentActivities?.rawItems?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{item.name}</div>
                          <div className="text-xs text-gray-500">{formatDate(item.createdAt)}</div>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === "In Stock" ? "bg-green-100 text-green-800" :
                          item.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {item.quantity}
                        </div>
                      </div>
                    ))}
                    {(!recentActivities?.rawItems || recentActivities.rawItems.length === 0) && (
                      <div className="text-sm text-gray-500 text-center py-2">No recent raw items</div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3">Recent Purchase Orders</div>
                  <div className="space-y-3">
                    {recentActivities?.purchaseOrders?.map((po, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-mono">{po.poNumber}</div>
                          <div className="text-xs text-gray-500">
                            {po.vendorName || po.vendor?.companyName} • {formatDate(po.createdAt)}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(po.totalAmount)}
                        </div>
                      </div>
                    ))}
                    {(!recentActivities?.purchaseOrders || recentActivities.purchaseOrders.length === 0) && (
                      <div className="text-sm text-gray-500 text-center py-2">No recent purchase orders</div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Quick Links</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push("/project-manager/dashboard/inventory/products/raw-items/add-edit-raw-item")}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md"
                    >
                      <Package className="w-3 h-3" />
                      Add Raw Item
                    </button>
                    <button
                      onClick={() => router.push("/project-manager/dashboard/inventory/operations/purchase-order/new-edit-receipt")}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Create PO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor & Summary Section */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Vendor Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Active Vendors</div>
                    <div className="text-2xl font-semibold text-gray-900 mt-1">{stats.vendors.active}</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3">Top Vendors by PO Value</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-900">Textile Corp Ltd</div>
                      <div className="text-sm font-medium text-gray-900">₹1,24,500</div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-900">Thread Masters</div>
                      <div className="text-sm font-medium text-gray-900">₹85,200</div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-900">Zipco Industries</div>
                      <div className="text-sm font-medium text-gray-900">₹42,800</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Summary</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm font-medium text-green-700">In Stock Items</div>
                    <div className="text-2xl font-semibold text-green-900 mt-1">
                      {stats.rawItems.inStock + stats.stockItems.inStock}
                    </div>
                    <div className="text-xs text-green-700 mt-1">Ready for production</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="text-sm font-medium text-red-700">Out of Stock</div>
                    <div className="text-2xl font-semibold text-red-900 mt-1">
                      {stats.rawItems.outOfStock + stats.stockItems.outOfStock}
                    </div>
                    <div className="text-xs text-red-700 mt-1">Need reordering</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Inventory Health</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stock Coverage</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Good</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Turnover Rate</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">45 days</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reorder Level</span>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600">15 items</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <InventoryFilters filters={filters} setFilters={setFilters} />

        {/* Table */}
        <InventoryTable filters={filters} />
      </div>
    </DashboardLayout>
  )
}