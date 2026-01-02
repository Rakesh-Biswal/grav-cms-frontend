"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  Filter,
  RefreshCw,
  User,
  Eye
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    fabricSuppliers: 0
  })
  const [filters, setFilters] = useState({
    status: "all",
    vendorType: "all"
  })
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    statuses: [],
    commonProducts: []
  })

  // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.vendorType !== "all") params.append("vendorType", filters.vendorType)

      const url = `${API_URL}/api/cms/vendors${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url, {
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        setVendors(result.vendors)
        setStats(result.stats)
        setAvailableFilters(result.filters)
      } else {
        toast.error(result.message || "Failed to fetch vendors")
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
      toast.error("Failed to fetch vendors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [filters])

  // Handle delete vendor (soft delete)
  const handleDeleteVendor = async (id) => {
    if (!confirm("Are you sure you want to mark this vendor as inactive?")) return

    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/${id}`, {
        method: "DELETE",
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Vendor marked as inactive")
        fetchVendors()
      } else {
        toast.error(result.message || "Failed to delete vendor")
      }
    } catch (error) {
      console.error("Error deleting vendor:", error)
      toast.error("Failed to delete vendor")
    }
  }

  // Handle status change
  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/${vendorId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Vendor status updated to ${newStatus}`)
        fetchVendors()
      } else {
        toast.error(result.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Inactive": return "bg-gray-100 text-gray-800"
      case "Blacklisted": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Get vendor type color
  const getVendorTypeColor = (type) => {
    switch (type) {
      case "Fabric Supplier": return "bg-blue-100 text-blue-800"
      case "Raw Material Supplier": return "bg-yellow-100 text-yellow-800"
      case "Accessories Supplier": return "bg-purple-100 text-purple-800"
      case "Packaging Supplier": return "bg-indigo-100 text-indigo-800"
      case "Equipment Supplier": return "bg-pink-100 text-pink-800"
      case "Logistics": return "bg-teal-100 text-teal-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Render rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Vendors & Suppliers</h1>
            <p className="text-gray-600 mt-1">Manage your clothing industry suppliers and vendors</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchVendors}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/project-manager/dashboard/inventory/vendors-buyer/vendors/add-edit-vendor"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add New Vendor
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Vendors</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Active Vendors</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">{stats.active}</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Fabric Suppliers</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">{stats.fabricSuppliers}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vendors by company, contact person, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchVendors()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchVendors}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Filter className="inline w-3 h-3 mr-1" />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {availableFilters.statuses?.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Filter className="inline w-3 h-3 mr-1" />
                  Vendor Type
                </label>
                <select
                  value={filters.vendorType}
                  onChange={(e) => handleFilterChange("vendorType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {availableFilters.types?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading vendors...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <tr key={vendor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                <Building className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{vendor.companyName}</div>
                                {vendor.contactPerson && (
                                  <div className="text-xs text-gray-500">
                                    Contact: {vendor.contactPerson}
                                  </div>
                                )}
                                {vendor.address?.city && (
                                  <div className="text-xs text-gray-500">
                                    {vendor.address.city}, {vendor.address.state}
                                  </div>
                                )}
                              </div>
                            </div>
                            {vendor.gstNumber && (
                              <div className="mt-1 text-xs text-gray-600">
                                GST: {vendor.gstNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVendorTypeColor(vendor.vendorType)}`}>
                            {vendor.vendorType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            {vendor.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-700">{vendor.email}</span>
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-700">{vendor.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {vendor.primaryProducts?.slice(0, 3).map((product, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {product}
                              </span>
                            ))}
                            {vendor.primaryProducts?.length > 3 && (
                              <span className="px-2 py-1 text-xs text-gray-500">
                                +{vendor.primaryProducts.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStars(vendor.rating)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={vendor.status}
                            onChange={(e) => handleStatusChange(vendor._id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusColor(vendor.status)}`}
                          >
                            <option value="Active" className="bg-green-100 text-green-800">Active</option>
                            <option value="Inactive" className="bg-gray-100 text-gray-800">Inactive</option>
                            <option value="Blacklisted" className="bg-red-100 text-red-800">Blacklisted</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/project-manager/dashboard/inventory/vendors-buyer/vendors/view/${vendor._id}`}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/project-manager/dashboard/inventory/vendors-buyer/vendors/add-edit-vendor/${vendor._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteVendor(vendor._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          No vendors found. Try different filters or add a new vendor.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vendor Types Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Vendor Categories in Clothing Industry:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2 rounded border flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Fabric Suppliers</span>
            </div>
            <div className="bg-white p-2 rounded border flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Raw Material Suppliers</span>
            </div>
            <div className="bg-white p-2 rounded border flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Accessories Suppliers</span>
            </div>
            <div className="bg-white p-2 rounded border flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>Packaging Suppliers</span>
            </div>
            <div className="bg-white p-2 rounded border flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Equipment Suppliers</span>
            </div>
            <div className="bg-white p-2 rounded border flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span>Logistics</span>
            </div>
            <div className="bg-white p-2 rounded border flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>Other Services</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}