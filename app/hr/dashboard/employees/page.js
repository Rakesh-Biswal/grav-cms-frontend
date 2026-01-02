"use client"

import Hr_DashboardLayout from "@/components/Hr_DashboardLayout"
import EmployeeCard from "./components/EmployeeCard.js"
import EmployeeFilters from "./components/EmployeeFilters"
import { useState, useEffect } from "react"
import { Users, UserPlus, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    search: "",
  })
  const [loading, setLoading] = useState(true)
  const [departmentStats, setDepartmentStats] = useState({})
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0
  })

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees()
  }, [filters, pagination.currentPage])


  const fetchEmployees = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        department: filters.department !== "all" ? filters.department : "",
        status: filters.status !== "all" ? filters.status : "",
        search: filters.search
      }).toString()

      const response = await fetch(
        `http://localhost:5000/api/employees/all?${queryParams}`,
        {
          method: "GET",
          credentials: "include" // 🔐 COOKIE AUTH
        }
      )

      const data = await response.json()

      if (data.success) {
        const formattedEmployees = data.data.employees.map(emp => ({
          id: emp._id,
          employeeId: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          position: emp.jobTitle,
          jobPosition: emp.jobPosition,
          employmentType: emp.employmentType,
          status: emp.status,
          dateOfJoining: emp.dateOfJoining,
          salary: `₹${emp.salary?.basic?.toLocaleString("en-IN") || "0"}`,
          netSalary: emp.salary?.netSalary,
          manager: emp.manager,
          avatarColor: getAvatarColor(emp.department)
        }))

        setEmployees(formattedEmployees)
        setFilteredEmployees(formattedEmployees)
        setTotalEmployees(data.data.stats?.total || 0)

        if (data.data.stats?.departmentStats) {
          const stats = {}
          data.data.stats.departmentStats.forEach(d => {
            stats[d._id] = d.count
          })
          setDepartmentStats(stats)
        }

        setPagination(data.data.pagination)
      }
    } catch (err) {
      console.error("Error fetching employees:", err)
    } finally {
      setLoading(false)
    }
  }


  const getAvatarColor = (department) => {
    const colors = {
      "IT": "bg-purple-500",
      "Production": "bg-blue-500",
      "Design": "bg-pink-500",
      "Sales": "bg-teal-500",
      "Quality Control": "bg-orange-500",
      "Inventory": "bg-yellow-500",
      "HR": "bg-purple-600",
      "Finance": "bg-indigo-500",
      "Marketing": "bg-red-500",
      "Operations": "bg-green-500"
    }
    return colors[department] || "bg-gray-500"
  }

  const handleAddNew = () => {
    router.push("/hr/dashboard/employees/new-employee")
  }

  const handleEditEmployee = (id) => {
    router.push(`/hr/dashboard/employees/new-employee?edit=true&id=${id}`)
  }

  const handleViewEmployee = (id) => {
    router.push(`/hr/dashboard/employees/${id}`)
  }

  // Fetch dashboard stats separately
  const fetchDashboardStats = async () => {
    try {


      const response = await fetch("http://localhost:5000/api/employees/stats/dashboard", {

      })

      const data = await response.json()

      if (data.success) {
        return data.data
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
    return null
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }))
    }
  }

  // Handle sort change
  const handleSortChange = (e) => {
    const sortBy = e.target.value
    let sorted = [...filteredEmployees]

    switch (sortBy) {
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "department":
        sorted.sort((a, b) => a.department.localeCompare(b.department))
        break
      case "salary_desc":
        sorted.sort((a, b) => (b.netSalary || 0) - (a.netSalary || 0))
        break
      case "salary_asc":
        sorted.sort((a, b) => (a.netSalary || 0) - (b.netSalary || 0))
        break
      default: // newest first
        sorted.sort((a, b) => new Date(b.dateOfJoining) - new Date(a.dateOfJoining))
    }

    setFilteredEmployees(sorted)
  }

  // Load dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats().then(stats => {
      if (stats) {
        // You can use these stats for dashboard widgets
        console.log("Dashboard stats:", stats)
      }
    })
  }, [])

  // Departments for filter dropdown
  const departments = [
    { id: "all", name: "All Departments" },
    { id: "Production", name: "Production" },
    { id: "Design", name: "Design" },
    { id: "Sales", name: "Sales" },
    { id: "Quality Control", name: "Quality Control" },
    { id: "Inventory", name: "Inventory" },
    { id: "IT", name: "IT" },
    { id: "HR", name: "HR" },
    { id: "Finance", name: "Finance" },
    { id: "Marketing", name: "Marketing" },
    { id: "Operations", name: "Operations" }
  ]

  return (
    <Hr_DashboardLayout activeMenu="employees">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Employees</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their information</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <UserPlus className="w-5 h-5" />
            Add New Employee
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{totalEmployees}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Production Team</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{departmentStats["Production"] || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Design Team</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{departmentStats["Design"] || 0}</p>
              </div>
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Today</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{departmentStats["active"] || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        {Object.keys(departmentStats).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(departmentStats).map(([dept, count]) => (
                <div key={dept} className="text-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 mt-1">{dept}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <EmployeeFilters filters={filters} setFilters={setFilters} departments={departments} />

        {/* Employee Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">
                {filteredEmployees.length} employees found
              </span>
            </div>
            <div className="flex items-center gap-4">
              <select
                onChange={handleSortChange}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="name_asc">Sort by: Name A-Z</option>
                <option value="name_desc">Sort by: Name Z-A</option>
                <option value="department">Sort by: Department</option>
                <option value="salary_desc">Sort by: Salary (High to Low)</option>
                <option value="salary_asc">Sort by: Salary (Low to High)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={() => handleEditEmployee(employee.id)}
                  onView={() => handleViewEmployee(employee.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => setFilters({ department: "all", status: "all", search: "" })}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredEmployees.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              Showing page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalEmployees} total employees
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 3) {
                  pageNum = i + 1
                } else if (pagination.currentPage === 1) {
                  pageNum = i + 1
                } else if (pagination.currentPage === pagination.totalPages) {
                  pageNum = pagination.totalPages - 2 + i
                } else {
                  pageNum = pagination.currentPage - 1 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${pagination.currentPage === pageNum
                      ? "bg-purple-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Hr_DashboardLayout>
  )
}