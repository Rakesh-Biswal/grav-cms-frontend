"use client"

import { Search, Filter } from "lucide-react"
import { useState } from "react"

export default function EmployeeFilters({ filters, setFilters }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const departments = [
    { id: "all", name: "All Departments" },
    { id: "production", name: "Production" },
    { id: "design", name: "Design" },
    { id: "sales", name: "Sales" },
    { id: "quality_control", name: "Quality Control" },
    { id: "inventory", name: "Inventory" },
    { id: "it", name: "IT" },
    { id: "hr", name: "HR" },
  ]

  const statuses = [
    { id: "all", name: "All Status" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
    { id: "on_leave", name: "On Leave" },
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      department: "all",
      status: "all",
      search: "",
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, email, or position..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Basic Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            More Filters
          </button>

          <button
            onClick={clearFilters}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Salaries</option>
                <option value="0-25000">₹0 - ₹25,000</option>
                <option value="25000-40000">₹25,000 - ₹40,000</option>
                <option value="40000+">₹40,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Any Time</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}