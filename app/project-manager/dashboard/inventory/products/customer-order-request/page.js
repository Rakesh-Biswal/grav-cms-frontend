"use client"

import { useState } from "react"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FileText, 
  Building, 
  User,
  Mail,
  Phone,
  Calendar,
  Filter,
  Eye,
  AlertCircle,
    DollarSign,
} from "lucide-react"
import NewCustomerRequestPopup from "./components/NewCustomerRequestPopup"
import DashboardLayout from "@/components/DashboardLayout"
import { useRouter } from "next/navigation"

// Mock data for existing customer requests
const mockCustomerRequests = [
  { 
    id: 1, 
    requestId: "REQ-2024-001",
    organization: "Fashion Retail Ltd.",
    organizationAddress: "123 Mall Road, Connaught Place, Delhi - 110001",
    contactPerson: "Rahul Verma",
    designation: "Purchase Manager",
    email: "rahul@fashionretail.com",
    primaryPhone: "+91 9876543210",
    secondaryPhone: "+91 9876543211",
    website: "www.fashionretail.com",
    date: "2024-01-15",
    products: [
      { name: "Men's Polo T-Shirt", description: "Premium cotton polo with collar", size: "M", color: "Navy Blue", quantity: 500, unit: "Pieces", unitPrice: 450, priceUnit: "Per Piece" },
      { name: "Women's Slim Fit Jeans", description: "Stretch denim jeans", size: "30", color: "Dark Blue", quantity: 250, unit: "Pieces", unitPrice: 850, priceUnit: "Per Piece" }
    ],
    totalAmount: 462500,
    status: "New",
    priority: "High",
    expectedDelivery: "2024-02-28",
    notes: "Need urgent delivery for summer collection launch",
    source: "Website Inquiry"
  },
  { 
    id: 2, 
    requestId: "REQ-2024-002",
    organization: "School Uniforms Inc.",
    organizationAddress: "45 Education Lane, Sector 15, Chandigarh - 160101",
    contactPerson: "Priya Sharma",
    designation: "Procurement Head",
    email: "priya@schooluniforms.in",
    primaryPhone: "+91 9876543211",
    secondaryPhone: "+91 9876543212",
    website: "www.schooluniforms.in",
    date: "2024-01-18",
    products: [
      { name: "School Shirts", description: "White cotton shirts with school logo", size: "12", color: "White", quantity: 1000, unit: "Pieces", unitPrice: 320, priceUnit: "Per Piece" },
      { name: "School Pants", description: "Navy blue trousers", size: "12", color: "Navy Blue", quantity: 1000, unit: "Pieces", unitPrice: 380, priceUnit: "Per Piece" },
      { name: "School Skirts", description: "Pleated skirts", size: "12", color: "Navy Blue", quantity: 500, unit: "Pieces", unitPrice: 350, priceUnit: "Per Piece" }
    ],
    totalAmount: 1070000,
    status: "Under Review",
    priority: "Medium",
    expectedDelivery: "2024-03-15",
    notes: "For new academic year starting in April",
    source: "Email Inquiry"
  },
]

// Status options
const statusOptions = ["New", "Under Review", "Pending Measurement", "Approved", "In Production", "Completed", "Cancelled"]

// Priority options
const priorityOptions = ["Low", "Medium", "High", "Urgent"]

// Source options
const sourceOptions = ["Website Inquiry", "Email Inquiry", "Phone Call", "Referral", "Walk-in", "Trade Show", "Social Media"]

// Unit options for pricing
const unitOptions = [
  "Per Piece", "Per Dozen", "Per Set", "Per Metre", "Per Kilogram", 
  "Per Square Metre", "Per Litre", "Per Box", "Per Pack", "Per Pair"
]

export default function CustomerProductsQuotationPage() {
  const [customerRequests, setCustomerRequests] = useState(mockCustomerRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const router = useRouter()

  // Filter requests based on search and filters
  const filteredRequests = customerRequests.filter(request => {
    const matchesSearch = 
      request.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Handle new customer request submission
  const handleAddCustomerRequest = (newRequestData) => {
    const newRequest = {
      id: customerRequests.length + 1,
      ...newRequestData
    }
    setCustomerRequests([...customerRequests, newRequest])
    setShowPopup(false)
  }

  // Handle edit request
  const handleEditRequest = (request) => {
    setSelectedRequest(request)
    setShowPopup(true)
  }

  // Handle delete request
  const handleDeleteRequest = (id) => {
    if (confirm("Are you sure you want to delete this customer request?")) {
      setCustomerRequests(customerRequests.filter(request => request.id !== id))
    }
  }

  // Handle view request
  const handleViewRequest = (request) => {
    router.push(`/dashboard/inventory/products/customer-order-request/customer-order-request-view/${request.id}`)
  }

  // Handle update request
  const handleUpdateRequest = (updatedRequestData) => {
    setCustomerRequests(customerRequests.map(request => 
      request.id === selectedRequest.id ? { ...request, ...updatedRequestData } : request
    ))
    setShowPopup(false)
    setSelectedRequest(null)
  }

  // Calculate statistics
  const totalRequests = customerRequests.length
  const newRequests = customerRequests.filter(r => r.status === "New").length
  const approvedRequests = customerRequests.filter(r => r.status === "Approved").length
  const highPriorityRequests = customerRequests.filter(r => r.priority === "High" || r.priority === "Urgent").length
  const totalPotentialValue = customerRequests.reduce((sum, r) => sum + r.totalAmount, 0)

  const getStatusColor = (status) => {
    switch(status) {
      case "New": return "bg-blue-100 text-blue-800"
      case "Under Review": return "bg-yellow-100 text-yellow-800"
      case "Pending Measurement": return "bg-purple-100 text-purple-800"
      case "Approved": return "bg-green-100 text-green-800"
      case "In Production": return "bg-indigo-100 text-indigo-800"
      case "Completed": return "bg-gray-100 text-gray-800"
      case "Cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "Low": return "bg-gray-100 text-gray-800"
      case "Medium": return "bg-blue-100 text-blue-800"
      case "High": return "bg-orange-100 text-orange-800"
      case "Urgent": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getProductSummary = (products) => {
    const totalProducts = products.length
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)
    return `${totalProducts} items (${totalQuantity} units)`
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customer Requests</h1>
            <p className="text-gray-600 mt-1">Manage customer requirements and organization details</p>
          </div>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Request
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-800">Total Requests</div>
                <div className="text-2xl font-semibold text-blue-900 mt-1">{totalRequests}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-800">New Requests</div>
                <div className="text-2xl font-semibold text-green-900 mt-1">{newRequests}</div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-orange-800">High Priority</div>
                <div className="text-2xl font-semibold text-orange-900 mt-1">{highPriorityRequests}</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-800">Total Value</div>
                <div className="text-2xl font-semibold text-purple-900 mt-1">
                  ₹{totalPotentialValue.toLocaleString('en-IN')}
                </div>
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
                placeholder="Search by organization, request ID, contact person, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Minimal Customer Requests Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 font-mono">{request.requestId}</div>
                        <div className="text-xs text-gray-500">
                          <Calendar className="inline w-3 h-3 mr-1" />
                          {request.date}
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{request.organization}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{request.organizationAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.contactPerson}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
                        <div className="text-xs text-gray-500">{request.primaryPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getProductSummary(request.products)}</div>
                        <div className="text-xs text-gray-500">Delivery: {request.expectedDelivery}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditRequest(request)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
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
                      <div className="text-gray-500">No customer requests found. Try a different search or add a new request.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Customer Request Popup */}
        {showPopup && (
          <NewCustomerRequestPopup
            isOpen={showPopup}
            onClose={() => {
              setShowPopup(false)
              setSelectedRequest(null)
            }}
            onSubmit={selectedRequest ? handleUpdateRequest : handleAddCustomerRequest}
            statusOptions={statusOptions}
            priorityOptions={priorityOptions}
            unitOptions={unitOptions}
            sourceOptions={sourceOptions}
            requestToEdit={selectedRequest}
          />
        )}
      </div>
    </DashboardLayout>
  )
}