"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import { 
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  User,
  FileText,
  Receipt,
  Package,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Printer,
  Download,
  Link as LinkIcon,
  ShoppingCart,
  Truck,
  CreditCard,
  BarChart,
  Percent,
  Tag,
  Building2,
  BanknoteIcon,
  FileSpreadsheet,
  ClipboardList,
  RefreshCw
} from "lucide-react"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function VendorViewPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [vendor, setVendor] = useState(null)
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [itemsSupplied, setItemsSupplied] = useState([])
  const [performance, setPerformance] = useState(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    onTimeDelivery: 0,
    pendingOrders: 0
  })

  // Fetch vendor data
  const fetchVendorData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/vendors/${params.id}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setVendor(result.vendor)
        
        // Fetch all related data
        await Promise.all([
          fetchPurchaseOrders(),
          fetchTransactions(),
          fetchItemsSupplied(),
          fetchPerformanceMetrics()
        ])
      } else {
        toast.error(result.message || "Failed to fetch vendor data")
        router.push("/project-manager/dashboard/inventory/vendors-buyer/vendors")
      }
    } catch (error) {
      console.error("Error fetching vendor:", error)
      toast.error("Failed to fetch vendor data")
      router.push("/project-manager/dashboard/inventory/vendors-buyer/vendors")
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/${params.id}/purchase-orders?limit=10`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPurchaseOrders(result.purchaseOrders)
        // Update stats
        setStats(prev => ({
          ...prev,
          totalOrders: result.stats.totalOrders,
          pendingOrders: result.stats.pendingOrders
        }))
      } else {
        console.error("Failed to fetch purchase orders:", result.message)
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/${params.id}/transactions`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTransactions(result.transactions)
        // Update stats with total spent
        setStats(prev => ({
          ...prev,
          totalSpent: result.stats.totalPaid
        }))
      } else {
        console.error("Failed to fetch transactions:", result.message)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  const fetchItemsSupplied = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/${params.id}/items-supplied`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setItemsSupplied(result.itemsSupplied)
      } else {
        console.error("Failed to fetch items supplied:", result.message)
      }
    } catch (error) {
      console.error("Error fetching items supplied:", error)
    }
  }

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/${params.id}/performance`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPerformance(result.performance)
        // Update stats
        setStats(prev => ({
          ...prev,
          onTimeDelivery: result.performance.onTimeDelivery
        }))
      } else {
        console.error("Failed to fetch performance metrics:", result.message)
      }
    } catch (error) {
      console.error("Error fetching performance metrics:", error)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchVendorData()
    }
  }, [params.id])

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Inactive": return "bg-gray-100 text-gray-800"
      case "Blacklisted": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Get vendor type color
  const getVendorTypeColor = (type) => {
    switch(type) {
      case "Fabric Supplier": return "bg-blue-100 text-blue-800"
      case "Raw Material Supplier": return "bg-yellow-100 text-yellow-800"
      case "Accessories Supplier": return "bg-purple-100 text-purple-800"
      case "Packaging Supplier": return "bg-indigo-100 text-indigo-800"
      case "Equipment Supplier": return "bg-pink-100 text-pink-800"
      case "Logistics": return "bg-teal-100 text-teal-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Get PO status color and text
  const getPOStatusColor = (status) => {
    switch(status) {
      case "COMPLETED": return { bg: "bg-green-100 text-green-800", text: "Completed" }
      case "PARTIALLY_RECEIVED": return { bg: "bg-blue-100 text-blue-800", text: "In Progress" }
      case "ISSUED": return { bg: "bg-yellow-100 text-yellow-800", text: "Pending" }
      case "CANCELLED": return { bg: "bg-red-100 text-red-800", text: "Cancelled" }
      case "DRAFT": return { bg: "bg-gray-100 text-gray-800", text: "Draft" }
      default: return { bg: "bg-gray-100 text-gray-800", text: status }
    }
  }

  // Get transaction status color
  const getTransactionStatusColor = (status) => {
    switch(status) {
      case "Paid": 
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "Pending": 
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "Failed": 
      case "PARTIAL": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Get transaction status text
  const getTransactionStatusText = (status) => {
    switch(status) {
      case "Paid": 
      case "COMPLETED": return "Paid"
      case "Pending": 
      case "PENDING": return "Pending"
      case "Failed": return "Failed"
      case "PARTIAL": return "Partial"
      default: return status
    }
  }

  // Get rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating?.toFixed(1) || '0.0'}/5</span>
      </div>
    )
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return "N/A"
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0"
    return `₹${parseFloat(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  // Calculate total pending amount from purchase orders
  const calculateTotalPendingAmount = () => {
    return purchaseOrders
      .filter(po => po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED")
      .reduce((sum, po) => sum + (po.totalAmount || 0), 0)
  }

  // Calculate delivered percentage
  const calculateDeliveredPercentage = (po) => {
    if (po.status === "CANCELLED") return 0
    if (po.status === "COMPLETED") return 100
    return po.progress || 0
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading vendor details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!vendor) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Vendor Not Found</h3>
                <div className="mt-1 text-sm text-red-700">
                  The requested vendor could not be found.
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/project-manager/dashboard/inventory/vendors-buyer/vendors"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vendors
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const totalPendingAmount = calculateTotalPendingAmount()

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/project-manager/dashboard/inventory/vendors-buyer/vendors"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Vendors
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{vendor.companyName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVendorTypeColor(vendor.vendorType)}`}>
                    {vendor.vendorType}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                  <span className="flex items-center text-sm text-gray-600">
                    {renderStars(vendor.rating || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchVendorData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <Link
              href={`/project-manager/dashboard/inventory/vendors-buyer/vendors/add-edit-vendor/${vendor._id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit Vendor
            </Link>
            <Link
              href={`/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <ShoppingCart className="w-4 h-4" />
              Create Purchase Order
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Orders</div>
                <div className="text-xl font-bold text-gray-900">{stats.totalOrders || 0}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {performance?.completedOrders || 0} completed
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Spent</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Avg: {formatCurrency(performance?.avgOrderValue || 0)}/order
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-md flex items-center justify-center">
                <Truck className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">On-Time Delivery</div>
                <div className="text-xl font-bold text-gray-900">{stats.onTimeDelivery || 0}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  Quality: {performance?.qualityRating?.toFixed(1) || '0.0'}/5
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Pending Orders</div>
                <div className="text-xl font-bold text-gray-900">{stats.pendingOrders || 0}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Amount: {formatCurrency(totalPendingAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {["details", "purchase-orders", "transactions", "items-supplied", "performance"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab === "details" && "Vendor Details"}
                  {tab === "purchase-orders" && "Purchase Orders"}
                  {tab === "transactions" && "Transactions"}
                  {tab === "items-supplied" && "Items Supplied"}
                  {tab === "performance" && "Performance"}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Vendor Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm text-gray-500">Company Name</div>
                            <div className="font-medium text-gray-900">{vendor.companyName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Vendor Type</div>
                            <div className="font-medium text-gray-900">{vendor.vendorType}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm text-gray-500">Contact Person</div>
                            <div className="font-medium text-gray-900">{vendor.contactPerson || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Rating</div>
                            <div className="font-medium text-gray-900">{renderStars(vendor.rating || 0)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="font-medium text-gray-900 flex items-center gap-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {vendor.email || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium text-gray-900 flex items-center gap-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {vendor.phone || "N/A"}
                            </div>
                          </div>
                        </div>
                        {vendor.alternatePhone && (
                          <div>
                            <div className="text-sm text-gray-500">Alternate Phone</div>
                            <div className="font-medium text-gray-900">{vendor.alternatePhone}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    {vendor.address && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Address
                        </h3>
                        <div className="space-y-2">
                          {vendor.address.street && (
                            <div className="text-gray-900">{vendor.address.street}</div>
                          )}
                          <div className="text-gray-900">
                            {vendor.address.city && `${vendor.address.city}, `}
                            {vendor.address.state && `${vendor.address.state}, `}
                            {vendor.address.pincode && `${vendor.address.pincode}`}
                          </div>
                          <div className="text-gray-900">{vendor.address.country || "India"}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Business Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Business Details
                      </h3>
                      <div className="space-y-3">
                        {vendor.gstNumber && (
                          <div>
                            <div className="text-sm text-gray-500">GST Number</div>
                            <div className="font-medium text-gray-900 font-mono">{vendor.gstNumber}</div>
                          </div>
                        )}
                        {vendor.panNumber && (
                          <div>
                            <div className="text-sm text-gray-500">PAN Number</div>
                            <div className="font-medium text-gray-900 font-mono">{vendor.panNumber}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bank Details */}
                    {vendor.bankDetails && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BanknoteIcon className="w-5 h-5" />
                          Bank Details
                        </h3>
                        <div className="space-y-3">
                          {vendor.bankDetails.bankName && (
                            <div>
                              <div className="text-sm text-gray-500">Bank Name</div>
                              <div className="font-medium text-gray-900">{vendor.bankDetails.bankName}</div>
                            </div>
                          )}
                          {vendor.bankDetails.accountNumber && (
                            <div>
                              <div className="text-sm text-gray-500">Account Number</div>
                              <div className="font-medium text-gray-900 font-mono">{vendor.bankDetails.accountNumber}</div>
                            </div>
                          )}
                          {vendor.bankDetails.ifscCode && (
                            <div>
                              <div className="text-sm text-gray-500">IFSC Code</div>
                              <div className="font-medium text-gray-900 font-mono">{vendor.bankDetails.ifscCode}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Primary Products */}
                    {vendor.primaryProducts && vendor.primaryProducts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Primary Products
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {vendor.primaryProducts.map((product, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {vendor.notes && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <ClipboardList className="w-5 h-5" />
                          Notes
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                          <div className="text-gray-700 whitespace-pre-line">{vendor.notes}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Orders Tab */}
            {activeTab === "purchase-orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
                  <Link
                    href={`/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    New Purchase Order
                  </Link>
                </div>

                {purchaseOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Purchase Orders</h3>
                    <p className="text-gray-600 mt-1">This vendor hasn't received any purchase orders yet.</p>
                    <Link
                      href={`/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order`}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Create First Purchase Order
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchaseOrders.map((po) => {
                      const statusInfo = getPOStatusColor(po.status)
                      return (
                        <div key={po._id} className="border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors">
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{po.poNumber}</span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg}`}>
                                    {statusInfo.text}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Date: {formatDate(po.date)} | 
                                  {po.deliveryDate && ` Delivery: ${formatDate(po.deliveryDate)}`}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{formatCurrency(po.totalAmount)}</div>
                                <div className="text-sm text-gray-600">
                                  {po.delivered} delivered, {po.pending} pending
                                </div>
                              </div>
                            </div>

                            {/* Delivery Progress */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Delivery Progress</span>
                                <span>{calculateDeliveredPercentage(po)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    po.status === "COMPLETED" 
                                      ? "bg-green-500" 
                                      : po.status === "CANCELLED"
                                      ? "bg-red-500"
                                      : "bg-blue-500"
                                  }`}
                                  style={{ width: `${calculateDeliveredPercentage(po)}%` }}
                                />
                              </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-2">
                              {po.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <div className="text-gray-700">
                                    {item.name} × {item.quantity} {item.unit}
                                  </div>
                                  <div className="text-gray-900 font-medium">
                                    {formatCurrency(item.quantity * (item.price || 0))}
                                  </div>
                                </div>
                              ))}
                              {po.items.length > 3 && (
                                <div className="text-sm text-gray-500">
                                  +{po.items.length - 3} more items
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                              <Link
                                href={`/project-manager/dashboard/inventory/operations/purchase-order/${po._id}`}
                                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                              >
                                View Details
                              </Link>
                              {(po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED") && (
                                <Link
                                  href={`/project-manager/dashboard/inventory/operations/purchase-order/${po._id}/receive`}
                                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Update Delivery
                                </Link>
                              )}
                              {po.status === "ISSUED" && (
                                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Transactions</h3>
                  <div className="text-sm text-gray-600">
                    Total: {formatCurrency(transactions.reduce((sum, t) => sum + (t.amount || 0), 0))}
                  </div>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Transactions</h3>
                    <p className="text-gray-600 mt-1">No financial transactions recorded for this vendor yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PO Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Method
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                transaction.type === "Payment" 
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.poNumber}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                                {getTransactionStatusText(transaction.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.paymentMethod}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Items Supplied Tab */}
            {activeTab === "items-supplied" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Items Supplied</h3>
                  <div className="text-sm text-gray-600">
                    Total Items: {itemsSupplied.length}
                  </div>
                </div>

                {itemsSupplied.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Items Supplied</h3>
                    <p className="text-gray-600 mt-1">This vendor hasn't supplied any items yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itemsSupplied.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-900 truncate">{item.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{item.sku}</div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Quantity</span>
                            <span className="font-medium text-gray-900">{item.totalQuantity}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Value</span>
                            <span className="font-medium text-gray-900">{formatCurrency(item.totalValue)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg. Price</span>
                            <span className="font-medium text-gray-900">{formatCurrency(item.avgPrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg. Delivery</span>
                            <span className="font-medium text-gray-900">{item.avgDeliveryTime} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Order</span>
                            <span className="font-medium text-gray-900">{formatDate(item.lastOrder)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <Link
                            href={`/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order`}
                            className="w-full text-center block px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Order Again
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Vendor Performance</h3>
                
                {!performance ? (
                  <div className="text-center py-8">
                    <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Performance Data</h3>
                    <p className="text-gray-600 mt-1">Performance metrics will be available after first purchase order.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Metrics */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white border border-gray-200 rounded-md p-4">
                            <div className="text-sm text-gray-600">On-Time Delivery Rate</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{performance.onTimeDelivery}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="h-2 rounded-full bg-green-500" 
                                style={{ width: `${performance.onTimeDelivery}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-md p-4">
                            <div className="text-sm text-gray-600">Quality Rating</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{performance.qualityRating.toFixed(1)}/5</div>
                            <div className="mt-2">{renderStars(performance.qualityRating)}</div>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-md p-4">
                          <div className="text-sm font-medium text-gray-900 mb-3">Order Status Distribution</div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Completed</span>
                              </div>
                              <span className="font-medium text-gray-900">{performance.completedOrders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Pending</span>
                              </div>
                              <span className="font-medium text-gray-900">{performance.pendingOrders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Cancelled</span>
                              </div>
                              <span className="font-medium text-gray-900">{performance.cancelledOrders}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column - Financial Performance */}
                      <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-md p-4">
                          <div className="text-sm font-medium text-gray-900 mb-3">Financial Summary</div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">Total Spent</span>
                              <span className="font-bold text-gray-900">{formatCurrency(performance.totalSpent)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">Average Order Value</span>
                              <span className="font-medium text-gray-900">{formatCurrency(performance.avgOrderValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">Payment On-Time Rate</span>
                              <span className="font-medium text-gray-900">{performance.paymentOnTime}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">Pending Amount</span>
                              <span className="font-medium text-red-600">{formatCurrency(performance.pendingAmount)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-md p-4">
                          <div className="text-sm font-medium text-gray-900 mb-3">Recent Trends</div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">Monthly Growth</span>
                              <span className={`flex items-center gap-1 font-medium ${
                                performance.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {performance.monthlyGrowth >= 0 ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                                {Math.abs(performance.monthlyGrowth)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">Order Frequency</span>
                              <span className="font-medium text-gray-900">{performance.orderFrequency} orders/month</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">Response Time</span>
                              <span className="font-medium text-gray-900">{performance.responseTime} hours avg.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Performance Insights</h4>
                          <ul className="mt-2 space-y-1 text-sm text-blue-700">
                            <li>• Vendor has {performance.onTimeDelivery >= 80 ? 'excellent' : 'good'} on-time delivery rate of {performance.onTimeDelivery}%</li>
                            <li>• Quality rating is {performance.qualityRating.toFixed(1)}/5 - {performance.qualityRating >= 4 ? 'Excellent' : performance.qualityRating >= 3 ? 'Good' : 'Needs Improvement'} performance</li>
                            <li>• Payment on-time rate is {performance.paymentOnTime}% - {performance.paymentOnTime >= 90 ? 'Excellent' : 'Keep monitoring'}</li>
                            <li>• {performance.pendingOrders} pending orders need attention ({formatCurrency(performance.pendingAmount)})</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Vendor Actions</h4>
              <p className="text-sm text-gray-500 mt-1">Manage this vendor or view related information</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/project-manager/dashboard/inventory/products/raw-items?vendor=${vendor._id}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Package className="w-4 h-4" />
                View Supplied Items
              </Link>
              <Link
                href={`/project-manager/dashboard/inventory/operations/purchase-order?vendor=${vendor._id}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <FileText className="w-4 h-4" />
                All Purchase Orders
              </Link>
              <Link
                href={`/project-manager/dashboard/inventory/vendors-buyer/vendors/add-edit-vendor/${vendor._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}