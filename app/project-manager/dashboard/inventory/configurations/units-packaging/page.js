"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function UnitsPackagingPage() {
  const [units, setUnits] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    base: 0
  })

  // Fetch units from backend
  const fetchUnits = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_URL}/api/cms/units`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setUnits(result.units)
        setStats(result.stats)
      } else {
        toast.error(result.message || "Failed to fetch units")
      }
    } catch (error) {
      console.error("Error fetching units:", error)
      toast.error("Failed to fetch units")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  // Handle delete unit
  const handleDeleteUnit = async (id) => {
    if (!confirm("Are you sure you want to mark this unit as inactive?")) return
    
    try {
      const response = await fetch(`${API_URL}/api/cms/units/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Unit marked as inactive")
        fetchUnits()
      } else {
        toast.error(result.message || "Failed to delete unit")
      }
    } catch (error) {
      console.error("Error deleting unit:", error)
      toast.error("Failed to delete unit")
    }
  }

  // Handle toggle status
  const handleToggleStatus = async (unit) => {
    const newStatus = unit.status === "Active" ? "Inactive" : "Active"
    
    try {
      const response = await fetch(`${API_URL}/api/cms/units/${unit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Unit ${newStatus === "Active" ? "activated" : "deactivated"}`)
        fetchUnits()
      } else {
        toast.error(result.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  // Filter units based on search
  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.gstUqc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Units & Packaging</h1>
            <p className="text-gray-600 mt-1">Manage measurement units and packaging configurations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUnits}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/project-manager/dashboard/inventory/configurations/units-packaging/add-edit-unit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add New Unit
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search units by name or GST UQC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Units Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading units...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST UQC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.length > 0 ? (
                    filteredUnits.map((unit) => (
                      <tr key={unit._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                          {unit.createdBy && (
                            <div className="text-xs text-gray-500">
                              By: {unit.createdBy.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {unit.gstUqc}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {unit.quantity} {unit.baseUnit ? unit.baseUnit.name : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {unit.baseUnit ? unit.baseUnit.name : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(unit)}
                            className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${
                              unit.status === "Active" 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {unit.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/project-manager/dashboard/inventory/configurations/units-packaging/add-edit-unit/${unit._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteUnit(unit._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete"
                              disabled={unit.baseUnit}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          {searchTerm ? "No units found matching your search" : "No units found. Add your first unit"}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm font-medium text-blue-800">Total Units</div>
            <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-sm font-medium text-green-800">Active Units</div>
            <div className="text-2xl font-semibold text-green-900 mt-1">{stats.active}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="text-sm font-medium text-purple-800">Base Units</div>
            <div className="text-2xl font-semibold text-purple-900 mt-1">{stats.base}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}