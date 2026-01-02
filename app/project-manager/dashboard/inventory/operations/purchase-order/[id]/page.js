// /project-manager/dashboard/inventory/operations/purchase-order/[id]/page.js

"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  Package,
  Users,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Percent,
  Tag,
  Printer,
  Download,
  RefreshCw,
  MoreVertical,
  CreditCard,
  TrendingUp,
  BarChart,
  Eye,
  FileCheck
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function PurchaseOrderViewPage() {
  const params = useParams()
  const router = useRouter()
  const poId = params?.id
  
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingPayment, setUpdatingPayment] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    notes: ""
  })

  useEffect(() => {
    if (poId) {
      fetchPurchaseOrder()
    }
  }, [poId])

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPurchaseOrder(result.purchaseOrder)
        
        // Initialize payment data with remaining amount
        const totalPaid = result.purchaseOrder.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
        const remainingAmount = result.purchaseOrder.totalAmount - totalPaid
        
        setPaymentData(prev => ({
          ...prev,
          amount: remainingAmount
        }))
      } else {
        toast.error(result.message || "Failed to fetch purchase order")
        router.push("/project-manager/dashboard/inventory/operations/purchase-order")
      }
    } catch (error) {
      console.error("Error fetching purchase order:", error)
      toast.error("Failed to fetch purchase order")
      router.push("/project-manager/dashboard/inventory/operations/purchase-order")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "ISSUED": return "bg-blue-100 text-blue-800"
      case "PARTIALLY_RECEIVED": return "bg-yellow-100 text-yellow-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "DRAFT": return <FileText className="w-4 h-4" />
      case "ISSUED": return <Clock className="w-4 h-4" />
      case "PARTIALLY_RECEIVED": return <AlertCircle className="w-4 h-4" />
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />
      case "CANCELLED": return <XCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-red-100 text-red-800"
      case "PARTIAL": return "bg-yellow-100 text-yellow-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const calculateDeliveryProgress = (po) => {
    if (!po.items || po.items.length === 0) return 0
    const totalOrdered = po.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalReceived = po.totalReceived || 0
    return Math.round((totalReceived / totalOrdered) * 100)
  }

  const calculatePaymentProgress = (po) => {
    const totalPaid = po.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    return Math.round((totalPaid / po.totalAmount) * 100)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    toast.success("Download functionality coming soon!")
  }

  const handleChangeStatus = async (newStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return
    
    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          notes: `Status changed to ${newStatus}`
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Purchase order status updated to ${newStatus}`)
        fetchPurchaseOrder()
      } else {
        toast.error(result.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    if (paymentData.amount <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }
    
    setUpdatingPayment(true)
    
    try {
      // First, let's update the payment status
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          referenceNumber: paymentData.referenceNumber,
          notes: paymentData.notes
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Payment recorded successfully")
        setShowPaymentModal(false)
        fetchPurchaseOrder()
        
        // Reset payment form
        setPaymentData({
          amount: 0,
          paymentMethod: "BANK_TRANSFER",
          referenceNumber: "",
          notes: ""
        })
      } else {
        toast.error(result.message || "Failed to record payment")
      }
    } catch (error) {
      console.error("Error recording payment:", error)
      toast.error("Failed to record payment")
    } finally {
      setUpdatingPayment(false)
    }
  }

  // Add payment status update API (needs to be added to backend)
  const updatePaymentStatus = async (status) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}/payment-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Payment status updated to ${status}`)
        fetchPurchaseOrder()
      } else {
        toast.error(result.message || "Failed to update payment status")
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Failed to update payment status")
    }
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading purchase order...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!purchaseOrder) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Purchase Order Not Found</h2>
          <p className="mt-2 text-gray-600">The requested purchase order could not be found.</p>
          <Link
            href="/project-manager/dashboard/inventory/operations/purchase-order"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchase Orders
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const deliveryProgress = calculateDeliveryProgress(purchaseOrder)
  const paymentProgress = calculatePaymentProgress(purchaseOrder)
  const totalPaid = purchaseOrder.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  const remainingPayment = purchaseOrder.totalAmount - totalPaid

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/project-manager/dashboard/inventory/operations/purchase-order"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Purchase Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                Purchase Order: {purchaseOrder.poNumber}
              </h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${getStatusColor(purchaseOrder.status)}`}>
                {getStatusIcon(purchaseOrder.status)}
                {purchaseOrder.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Created on {formatDate(purchaseOrder.orderDate)} • Vendor: {purchaseOrder.vendorName || purchaseOrder.vendor?.companyName}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPurchaseOrder}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            {purchaseOrder.status === "DRAFT" && (
              <Link
                href={`/project-manager/dashboard/inventory/operations/purchase-order/new-edit-receipt/${poId}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit PO
              </Link>
            )}
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">Total Amount</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(purchaseOrder.totalAmount)}
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">Delivery Progress</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {deliveryProgress}%
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {purchaseOrder.totalReceived || 0} of {purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)} units
                </div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">Payment Status</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {paymentProgress}%
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatCurrency(totalPaid)} of {formatCurrency(purchaseOrder.totalAmount)}
                </div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">Items</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {purchaseOrder.items.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)} total units
                </div>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Order Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">PO Number</div>
                  <div className="text-lg font-semibold text-gray-900 font-mono">{purchaseOrder.poNumber}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Order Date</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDate(purchaseOrder.orderDate)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Expected Delivery</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {purchaseOrder.expectedDeliveryDate ? formatDate(purchaseOrder.expectedDeliveryDate) : "Not specified"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Payment Terms</div>
                  <div className="text-lg font-semibold text-gray-900">{purchaseOrder.paymentTerms || "Not specified"}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Notes</div>
                <div className="text-gray-600 whitespace-pre-wrap">
                  {purchaseOrder.notes || "No notes provided"}
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h2>
                <div className="text-sm text-gray-600">
                  {purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                            <div className="text-xs text-gray-500">{item.sku} • {item.unit}</div>
                            {item.rawItem && (
                              <Link
                                href={`/project-manager/dashboard/inventory/products/raw-items/raw-items-view/${item.rawItem._id || item.rawItem}`}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View Item
                              </Link>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {item.quantity} {item.unit}
                          </div>
                          {item.receivedQuantity > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              Received: {item.receivedQuantity}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            item.status === "PARTIALLY_RECEIVED" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {item.status?.replace("_", " ") || "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Items Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(purchaseOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({purchaseOrder.taxRate}%):</span>
                      <span className="font-medium">{formatCurrency(purchaseOrder.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping Charges:</span>
                      <span className="font-medium">{formatCurrency(purchaseOrder.shippingCharges)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium">{formatCurrency(purchaseOrder.discount)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">{formatCurrency(purchaseOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery History Card */}
            {purchaseOrder.deliveries && purchaseOrder.deliveries.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery History
                </h2>
                
                <div className="space-y-4">
                  {purchaseOrder.deliveries.map((delivery, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Delivery #{purchaseOrder.deliveries.length - index}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {formatDate(delivery.deliveryDate)} • {delivery.quantityReceived} units
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          by {delivery.receivedBy?.name || "System"}
                        </div>
                      </div>
                      {delivery.invoiceNumber && (
                        <div className="mt-2 text-sm text-gray-600">
                          Invoice: {delivery.invoiceNumber}
                        </div>
                      )}
                      {delivery.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          Notes: {delivery.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Vendor & Actions */}
          <div className="space-y-6">
            {/* Vendor Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Vendor Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Vendor Name</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {purchaseOrder.vendorName || purchaseOrder.vendor?.companyName}
                  </div>
                </div>
                
                {purchaseOrder.vendor?.contactPerson && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Contact Person</div>
                    <div className="text-gray-900">{purchaseOrder.vendor.contactPerson}</div>
                  </div>
                )}
                
                {purchaseOrder.vendor?.phone && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Phone</div>
                    <div className="text-gray-900">{purchaseOrder.vendor.phone}</div>
                  </div>
                )}
                
                {purchaseOrder.vendor?.email && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Email</div>
                    <div className="text-gray-900">{purchaseOrder.vendor.email}</div>
                  </div>
                )}
                
                {purchaseOrder.vendor?.gstNumber && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">GST Number</div>
                    <div className="text-gray-900 font-mono">{purchaseOrder.vendor.gstNumber}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/project-manager/dashboard/inventory/vendors-buyer/vendors/${purchaseOrder.vendor?._id || purchaseOrder.vendor}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md"
                >
                  <Eye className="w-4 h-4" />
                  View Vendor Profile
                </Link>
              </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">Payment Progress</div>
                    <div className="text-sm font-medium text-gray-900">{paymentProgress}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${paymentProgress === 100 ? 'bg-green-500' : paymentProgress > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Total Amount</div>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(purchaseOrder.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Paid Amount</div>
                    <div className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Remaining Amount</div>
                  <div className="text-xl font-semibold text-red-600">{formatCurrency(remainingPayment)}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Payment Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(purchaseOrder.paymentStatus)}`}>
                    {purchaseOrder.paymentStatus}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={remainingPayment <= 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-4 h-4" />
                    Record Payment
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updatePaymentStatus("PARTIAL")}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 rounded-md"
                    >
                      <TrendingUp className="w-3 h-3" />
                      Mark Partial
                    </button>
                    <button
                      onClick={() => updatePaymentStatus("COMPLETED")}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Mark Paid
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MoreVertical className="w-5 h-5" />
                Quick Actions
              </h2>
              
              <div className="space-y-2">
                {purchaseOrder.status === "DRAFT" && (
                  <button
                    onClick={() => handleChangeStatus("ISSUED")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FileCheck className="w-4 h-4" />
                    Issue Purchase Order
                  </button>
                )}
                
                {purchaseOrder.status === "ISSUED" && (
                  <button
                    onClick={() => handleChangeStatus("CANCELLED")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Order
                  </button>
                )}
                
                <Link
                  href={`/project-manager/dashboard/inventory/operations/purchase-order/new-edit-receipt/${poId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md"
                >
                  <Edit className="w-4 h-4" />
                  Edit Purchase Order
                </Link>
                
                <Link
                  href={`/project-manager/dashboard/inventory/operations/purchase-order/${poId}/receive`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md"
                >
                  <Truck className="w-4 h-4" />
                  Receive Delivery
                </Link>
                
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md"
                >
                  <Printer className="w-4 h-4" />
                  Print PO
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Record Payment</h3>
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max={remainingPayment}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Remaining amount: {formatCurrency(remainingPayment)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="ONLINE">Online Payment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={paymentData.referenceNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Transaction ID, Cheque No."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any payment notes..."
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPayment}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Record Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}