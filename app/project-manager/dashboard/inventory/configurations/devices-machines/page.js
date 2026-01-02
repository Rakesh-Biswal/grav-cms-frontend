"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Settings, 
  Zap, 
  Activity, 
  Calendar,
  Tag,
  Wrench,
  RefreshCw,
  Filter
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function DevicesMachinesPage() {
  const [machines, setMachines] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    operational: 0,
    maintenanceNeeded: 0,
    totalPower: "0W"
  })
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    location: "all"
  })
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    locations: [],
    statuses: []
  })

  // Fetch machines from backend
  const fetchMachines = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.type !== "all") params.append("type", filters.type)
      if (filters.location !== "all") params.append("location", filters.location)
      
      const url = `${API_URL}/api/cms/machines${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await fetch(url, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMachines(result.machines)
        setStats(result.stats)
        setAvailableFilters(result.filters)
      } else {
        toast.error(result.message || "Failed to fetch machines")
      }
    } catch (error) {
      console.error("Error fetching machines:", error)
      toast.error("Failed to fetch machines")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()
  }, [filters])

  // Handle delete machine
  const handleDeleteMachine = async (id) => {
    if (!confirm("Are you sure you want to delete this machine record?")) return
    
    try {
      const response = await fetch(`${API_URL}/api/cms/machines/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Machine deleted successfully")
        fetchMachines()
      } else {
        toast.error(result.message || "Failed to delete machine")
      }
    } catch (error) {
      console.error("Error deleting machine:", error)
      toast.error("Failed to delete machine")
    }
  }

  // Handle status change
  const handleStatusChange = async (machineId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/machines/${machineId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Machine status updated to ${newStatus}`)
        fetchMachines()
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "Operational": return "bg-green-100 text-green-800"
      case "Under Maintenance": return "bg-yellow-100 text-yellow-800"
      case "Idle": return "bg-blue-100 text-blue-800"
      case "Repair Needed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Devices & Machines</h1>
            <p className="text-gray-600 mt-1">Manage manufacturing equipment and maintenance schedules</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMachines}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/project-manager/dashboard/inventory/configurations/devices-machines/add-edit-machine"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Register New Machine
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Machines</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Operational</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">{stats.operational}</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Total Power</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">{stats.totalPower}</div>
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
                placeholder="Search machines by name, model, or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchMachines()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchMachines}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {availableFilters.types?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Filter className="inline w-3 h-3 mr-1" />
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  {availableFilters.locations?.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Machines Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading machines...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Power</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {machines.length > 0 ? (
                    machines.map((machine) => (
                      <tr key={machine._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                <Settings className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                                <div className="text-xs text-gray-500">
                                  Model: {machine.model} | SN: {machine.serialNumber}
                                </div>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                              <Tag className="inline w-3 h-3 mr-1" />
                              {machine.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {machine.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={machine.status}
                            onChange={(e) => handleStatusChange(machine._id, e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusColor(machine.status)}`}
                          >
                            <option value="Operational" className="bg-green-100 text-green-800">Operational</option>
                            <option value="Under Maintenance" className="bg-yellow-100 text-yellow-800">Under Maintenance</option>
                            <option value="Idle" className="bg-blue-100 text-blue-800">Idle</option>
                            <option value="Repair Needed" className="bg-red-100 text-red-800">Repair Needed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">
                              Next: {formatDate(machine.nextMaintenance)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Last: {formatDate(machine.lastMaintenance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {machine.powerConsumption}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/project-manager/dashboard/inventory/configurations/devices-machines/add-edit-machine/${machine._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteMachine(machine._id)}
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
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          No machines found. Try different filters or add a new machine.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Maintenance Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Wrench className="w-3 h-3 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Maintenance Required</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>{stats.maintenanceNeeded} machines need attention</p>
                  <p className="mt-1 text-xs">Regular maintenance ensures optimal performance and longevity</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Production Status</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>{stats.operational} out of {stats.total} machines are operational</p>
                  <p className="mt-1 text-xs">
                    {stats.total > 0 ? ((stats.operational / stats.total) * 100).toFixed(0) : 0}% operational rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}