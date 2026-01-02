"use client"

import { MoreVertical, Phone, Mail, Briefcase, Calendar, Edit, Eye } from "lucide-react"
import { useState } from "react"

export default function EmployeeCard({ employee, onEdit, onView }) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'on_leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
      {/* More Options Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                onView()
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => {
                onEdit()
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Employee
            </button>
          </div>
        )}
      </div>

      {/* Employee Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`${employee.avatarColor} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold`}>
          {employee.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-gray-600 text-sm">{employee.position}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
              {employee.status === 'active' ? 'Active' : employee.status}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span>{employee.department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Joined: {formatDate(employee.dateOfJoining)}</span>
        </div>
      </div>

      

      {/* Manager Info */}
      {employee.manager && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Reports to</p>
          <p className="text-sm font-medium text-gray-900">{employee.manager}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  )
}