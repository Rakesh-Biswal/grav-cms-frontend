"use client"

import { useState, useEffect } from "react"
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText,
  CreditCard,
  Shield,
  Clock,
  Building
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useParams } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ViewOperatorPage() {
  const params = useParams()
  const operatorId = params?.id
  const [loading, setLoading] = useState(true)
  const [operator, setOperator] = useState(null)

  useEffect(() => {
    if (operatorId) {
      fetchOperatorDetails()
    }
  }, [operatorId])

  const fetchOperatorDetails = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_URL}/api/cms/employees/operators/${operatorId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setOperator(result.data)
      } else {
        toast.error(result.message || "Failed to fetch operator details")
      }
    } catch (error) {
      console.error("Error fetching operator:", error)
      toast.error("Failed to fetch operator details")
    } finally {
      setLoading(false)
    }
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

  const formatStatus = (status) => {
    switch(status) {
      case "active": return "Active"
      case "on_leave": return "On Leave"
      case "draft": return "Draft"
      case "inactive": return "Inactive"
      default: return status
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading operator details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!operator) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="text-center py-12">
          <div className="text-gray-500">Operator not found</div>
          <Link
            href="/project-manager/dashboard/inventory/configurations/assigned-team"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Operators
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/project-manager/dashboard/inventory/configurations/assigned-team"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Operators
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {operator.firstName} {operator.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {operator.employeeId}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(operator.status)}`}>
                  {formatStatus(operator.status)}
                </span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info & Contact */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{operator.firstName} {operator.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900">{operator.gender ? operator.gender.charAt(0).toUpperCase() + operator.gender.slice(1) : "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">{formatDate(operator.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-gray-900">{operator.maritalStatus ? operator.maritalStatus.charAt(0).toUpperCase() + operator.maritalStatus.slice(1) : "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">Email</label>
                  </div>
                  <p className="text-gray-900">{operator.email || "N/A"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                  </div>
                  <p className="text-gray-900">{operator.phone || "N/A"}</p>
                </div>
                {operator.alternatePhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Alternate Phone</label>
                    <p className="text-gray-900">{operator.alternatePhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Work Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Work Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{operator.department || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Position</label>
                  <p className="text-gray-900">{operator.jobPosition || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Title</label>
                  <p className="text-gray-900">{operator.jobTitle || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employment Type</label>
                  <p className="text-gray-900">
                    {operator.employmentType === "full_time" ? "Full Time" : 
                     operator.employmentType === "part_time" ? "Part Time" : 
                     operator.employmentType === "contract" ? "Contract" : 
                     operator.employmentType === "intern" ? "Intern" : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <p className="text-gray-900">{operator.manager || "N/A"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">Date of Joining</label>
                  </div>
                  <p className="text-gray-900">{formatDate(operator.dateOfJoining)}</p>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">Work Location</label>
                  </div>
                  <p className="text-gray-900">{operator.workLocation || "GRAV Clothing"}</p>
                </div>
              </div>
            </div>

            {/* Address Information Card */}
            {operator.address?.current && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Address</h3>
                    <div className="text-gray-900">
                      {operator.address.current.street && <p>{operator.address.current.street}</p>}
                      {operator.address.current.city && <p>{operator.address.current.city}</p>}
                      {operator.address.current.state && <p>{operator.address.current.state}</p>}
                      {operator.address.current.pincode && <p>{operator.address.current.pincode}</p>}
                      {operator.address.current.country && <p>{operator.address.current.country}</p>}
                    </div>
                  </div>
                  {operator.address.permanent && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Permanent Address</h3>
                      <div className="text-gray-900">
                        {operator.address.permanent.street && <p>{operator.address.permanent.street}</p>}
                        {operator.address.permanent.city && <p>{operator.address.permanent.city}</p>}
                        {operator.address.permanent.state && <p>{operator.address.permanent.state}</p>}
                        {operator.address.permanent.pincode && <p>{operator.address.permanent.pincode}</p>}
                        {operator.address.permanent.country && <p>{operator.address.permanent.country}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Documents & Status */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Status Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(operator.status)}`}>
                      {formatStatus(operator.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">System Status</label>
                  <p className={`mt-1 ${operator.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {operator.isActive ? 'Active in System' : 'Inactive in System'}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">Joining Duration</label>
                  </div>
                  {operator.dateOfJoining && (
                    <p className="text-gray-900">
                      {(() => {
                        const joinDate = new Date(operator.dateOfJoining)
                        const today = new Date()
                        const years = today.getFullYear() - joinDate.getFullYear()
                        const months = today.getMonth() - joinDate.getMonth()
                        const totalMonths = years * 12 + months
                        return totalMonths >= 12 
                          ? `${Math.floor(totalMonths/12)} year${Math.floor(totalMonths/12) > 1 ? 's' : ''} ${totalMonths%12} month${totalMonths%12 > 1 ? 's' : ''}`
                          : `${totalMonths} month${totalMonths > 1 ? 's' : ''}`
                      })()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
              </div>
              <div className="space-y-3">
                {operator.documents?.aadharNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Aadhar Number</label>
                    <p className="text-gray-900 font-mono">{operator.documents.aadharNumber}</p>
                  </div>
                )}
                {operator.documents?.panNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">PAN Number</label>
                    <p className="text-gray-900 font-mono">{operator.documents.panNumber}</p>
                  </div>
                )}
                {operator.documents?.uanNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">UAN Number</label>
                    <p className="text-gray-900 font-mono">{operator.documents.uanNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Salary Information Card */}
            {operator.salary && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Salary Information</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Basic Salary</label>
                    <p className="text-gray-900">₹{operator.salary.basic?.toLocaleString('en-IN') || "0"}</p>
                  </div>
                  {operator.salary.allowances > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Allowances</label>
                      <p className="text-gray-900">₹{operator.salary.allowances.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  {operator.salary.deductions > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Deductions</label>
                      <p className="text-gray-900">₹{operator.salary.deductions.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-500">Net Salary</label>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{operator.salary.netSalary?.toLocaleString('en-IN') || "0"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}