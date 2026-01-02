"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, MapPin, Package, RefreshCw, Building } from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalItems: 0
  })

  // Fetch warehouses from backend
  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_URL}/api/cms/warehouses`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setWarehouses(result.warehouses)
        setStats(result.stats)
      } else {
        toast.error(result.message || "Failed to fetch warehouses")
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error)
      toast.error("Failed to fetch warehouses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  // Handle delete warehouse
  const handleDeleteWarehouse = async (id) => {
    if (!confirm("Are you sure you want to delete this warehouse? This action cannot be undone.")) return
    
    try {
      const response = await fetch(`${API_URL}/api/cms/warehouses/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Warehouse deleted successfully")
        fetchWarehouses()
      } else {
        toast.error(result.message || "Failed to delete warehouse")
      }
    } catch (error) {
      console.error("Error deleting warehouse:", error)
      toast.error("Failed to delete warehouse")
    }
  }

  // Handle status change
  const handleStatusChange = async (warehouseId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/warehouses/${warehouseId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Warehouse status updated to ${newStatus}`)
        fetchWarehouses()
      } else {
        toast.error(result.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  // Handle capacity update
  const handleCapacityUpdate = async (warehouseId) => {
    const newCapacity = prompt("Enter new capacity (e.g., 10000 sq ft):")
    if (!newCapacity) return
    
    try {
      const response = await fetch(`${API_URL}/api/cms/warehouses/${warehouseId}/capacity`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ capacity: newCapacity })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Warehouse capacity updated")
        fetchWarehouses()
      } else {
        toast.error(result.message || "Failed to update capacity")
      }
    } catch (error) {
      console.error("Error updating capacity:", error)
      toast.error("Failed to update capacity")
    }
  }

  // Filter warehouses based on search
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Warehouse Management</h1>
            <p className="text-gray-600 mt-1">Manage your storage locations and facilities</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchWarehouses}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/project-manager/dashboard/inventory/configurations/warehouse/add-edit-warehouse"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add New Warehouse
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Warehouses</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <div className="w-5 h-5 text-green-600">✓</div>
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Active Warehouses</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">{stats.active}</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <div className="text-purple-600 font-bold">Σ</div>
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Total Items Stored</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">{formatNumber(stats.totalItems)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="flex items-center gap-2">
            <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search warehouses by name, short name, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchWarehouses()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchWarehouses}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
            >
              Search
            </button>
          </div>
        </div>

        {/* Warehouses Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading warehouses...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWarehouses.length > 0 ? (
                    filteredWarehouses.map((warehouse) => (
                      <tr key={warehouse._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{warehouse.shortName}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-600 line-clamp-1">
                              {warehouse.address}
                            </div>
                            {warehouse.createdBy && (
                              <div className="mt-1 text-xs text-gray-500">
                                Added by: {warehouse.createdBy.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleCapacityUpdate(warehouse._id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            title="Click to edit capacity"
                          >
                            {warehouse.capacity}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {warehouse.itemsCount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">items</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={warehouse.status}
                            onChange={(e) => handleStatusChange(warehouse._id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                              warehouse.status === "Active" 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            <option value="Active" className="bg-green-100 text-green-800">Active</option>
                            <option value="Inactive" className="bg-red-100 text-red-800">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/project-manager/dashboard/inventory/configurations/warehouse/add-edit-warehouse/${warehouse._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteWarehouse(warehouse._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                              disabled={warehouse.itemsCount > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          {searchTerm ? "No warehouses found matching your search" : "No warehouses found. Add your first warehouse"}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">Warehouse Management Tips</h3>
              <div className="mt-1 text-sm text-gray-700 space-y-1">
                <p>• Use short names for easy reference in documents and reports (e.g., WH-MAIN, WH-NORTH)</p>
                <p>• Keep warehouse addresses complete for delivery and logistics</p>
                <p>• Only deactivate warehouses when they are no longer in use</p>
                <p>• Click on capacity to update as your storage needs change</p>
                <p>• Cannot delete warehouses that contain items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}