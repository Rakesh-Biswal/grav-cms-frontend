"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Briefcase, 
  Search, 
  Filter,
  Eye,
  UserCheck,
  TrendingUp,
  Clock,
  RefreshCw
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function AssignedTeamsPage() {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    trainee: 0
  })

  // Departments for filter dropdown (only operator departments)
  const departments = [
    { id: "all", name: "All Departments" },
    { id: "Sewing", name: "Sewing" },
    { id: "Embroidery", name: "Embroidery" },
    { id: "Cutting", name: "Cutting" },
    { id: "Finishing", name: "Finishing" },
    { id: "Quality Control", name: "Quality Control" },
    { id: "Maintenance", name: "Maintenance" },
    { id: "Packing", name: "Packing" },
    { id: "Store", name: "Store" }
  ]

  // Fetch operator employees from backend
  const fetchOperatorEmployees = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_URL}/api/cms/employees/operators`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setEmployees(result.employees)
        setFilteredEmployees(result.employees)
        setStats(result.stats)
      } else {
        toast.error(result.message || "Failed to fetch employees")
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperatorEmployees()
  }, [])

  // Filter employees based on search and filters
  useEffect(() => {
    let filtered = [...employees]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.jobPosition?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(employee => employee.department === departmentFilter)
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(employee => employee.status === statusFilter)
    }
    
    setFilteredEmployees(filtered)
  }, [searchTerm, departmentFilter, statusFilter, employees])

  // Calculate department counts
  const calculateDepartmentCounts = () => {
    const counts = {}
    employees.forEach(emp => {
      counts[emp.department] = (counts[emp.department] || 0) + 1
    })
    return counts
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "active": return "bg-green-100 text-green-800"
      case "on_leave": return "bg-yellow-100 text-yellow-800"
      case "draft": return "bg-blue-100 text-blue-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDepartmentColor = (department) => {
    switch(department) {
      case "Sewing": return "bg-purple-100 text-purple-800"
      case "Embroidery": return "bg-pink-100 text-pink-800"
      case "Cutting": return "bg-indigo-100 text-indigo-800"
      case "Finishing": return "bg-teal-100 text-teal-800"
      case "Quality Control": return "bg-amber-100 text-amber-800"
      case "Maintenance": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status) => {
    switch(status) {
      case "active": return "Active"
      case "on_leave": return "On Leave"
      case "draft": return "Draft"
      case "inactive": return "Inactive"
      default: return status
    }
  }

  const departmentCounts = calculateDepartmentCounts()
  const topDepartments = Object.entries(departmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Assigned Teams (Operators)</h1>
            <p className="text-gray-600 mt-1">View and manage production department operators</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOperatorEmployees}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Operators</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">Active Operators</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">{stats.active}</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">On Leave</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">{stats.onLeave}</div>
              </div>
            </div>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-md flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-pink-800">Trainees</div>
                <div className="text-2xl font-semibold text-pink-900 mt-1">{stats.trainee}</div>
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
                placeholder="Search operators by name, ID, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading operators...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department & Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Joining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {employee.firstName?.[0]}{employee.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">{employee.employeeId}</div>
                              <div className="mt-1 text-xs text-gray-600">
                                {employee.employmentType === "full_time" ? "Full Time" : 
                                 employee.employmentType === "part_time" ? "Part Time" : 
                                 employee.employmentType === "contract" ? "Contract" : 
                                 employee.employmentType === "intern" ? "Intern" : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDepartmentColor(employee.department)}`}>
                              {employee.department}
                            </span>
                            <div className="text-sm font-medium text-gray-900">{employee.jobTitle}</div>
                            <div className="text-sm text-gray-600">{employee.jobPosition}</div>
                            {employee.manager && (
                              <div className="text-xs text-gray-500">
                                Manager: {employee.manager}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <div className="text-gray-900">{employee.email}</div>
                            <div className="text-gray-600">{employee.phone}</div>
                            {employee.alternatePhone && (
                              <div className="text-gray-500 text-xs">Alt: {employee.alternatePhone}</div>
                            )}
                            <div className="text-gray-500 text-xs mt-2">
                              {employee.workLocation || "GRAV Clothing"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                              {formatStatus(employee.status)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700">
                                Joined: {new Date(employee.dateOfJoining).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            {employee.isActive !== undefined && (
                              <div className={`text-xs ${employee.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {employee.isActive ? '✓ Active in System' : '✗ Inactive in System'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/project-manager/dashboard/inventory/configurations/assigned-team/view/${employee._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          {searchTerm || departmentFilter !== "all" || statusFilter !== "all" 
                            ? "No operators found matching your filters" 
                            : "No operators found in the Operator department"}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Department Distribution */}
        {topDepartments.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Department Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topDepartments.map(([dept, count]) => (
                <div key={dept} className="bg-white p-3 rounded-md border border-gray-200">
                  <div className="text-xs text-gray-500">{dept}</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{count}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Operator Management</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>• This page shows only employees from the "Operator" department</p>
                <p>• Operators are production floor workers managed by Project Manager</p>
                <p>• Contact HR department for any employee-related changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}