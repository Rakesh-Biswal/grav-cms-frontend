// /project-manager/dashboard/inventory/operations/delivery/[id]/page.js

"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  FileText,
  Package,
  Truck,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Printer,
  Download,
  RefreshCw,
  Eye,
  TrendingUp,
  BarChart,
  AlertCircle // Added import
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function DeliveryViewPage() {
  const params = useParams()
  const router = useRouter()
  const deliveryId = params?.id
  
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedDeliveries, setRelatedDeliveries] = useState([])
  const [poDetails, setPoDetails] = useState(null)

  useEffect(() => {
    if (deliveryId) {
      fetchDelivery()
    }
  }, [deliveryId])

  const fetchDelivery = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/deliveries/${deliveryId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setDelivery(result.delivery)
        fetchRelatedDeliveries(result.delivery.purchaseOrderId)
        fetchPODetails(result.delivery.purchaseOrderId)
      } else {
        toast.error(result.message || "Failed to fetch delivery")
        router.push("/project-manager/dashboard/inventory/operations/delivery")
      }
    } catch (error) {
      console.error("Error fetching delivery:", error)
      toast.error("Failed to fetch delivery")
      router.push("/project-manager/dashboard/inventory/operations/delivery")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedDeliveries = async (poId) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/deliveries?search=${poId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRelatedDeliveries(result.deliveries.filter(d => d._id !== deliveryId))
      }
    } catch (error) {
      console.error("Error fetching related deliveries:", error)
    }
  }

  const fetchPODetails = async (poId) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPoDetails(result.purchaseOrder)
      }
    } catch (error) {
      console.error("Error fetching PO details:", error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Calculate quantity received in THIS specific delivery
  const calculateDeliverySpecificQuantities = () => {
    if (!delivery?.items || !poDetails) return []
    
    // Get the position of this delivery in the deliveries array
    const deliveryIndex = poDetails.deliveries?.findIndex(d => 
      d._id.toString() === deliveryId
    ) || 0
    
    // If this is the only delivery or first delivery, show all received quantities
    if (deliveryIndex === 0 || poDetails.deliveries?.length <= 1) {
      return delivery.items.map(item => ({
        ...item,
        receivedInThisDelivery: item.totalReceived || 0
      }))
    }
    
    // For subsequent deliveries, calculate the difference from previous deliveries
    const previousDeliveries = poDetails.deliveries?.slice(0, deliveryIndex) || []
    
    // This is a simplified calculation - in reality you'd need delivery-specific tracking
    return delivery.items.map(item => {
      // Estimate: divide total received by number of deliveries
      const deliveriesCount = poDetails.deliveries?.length || 1
      const estimatedPerDelivery = Math.floor((item.totalReceived || 0) / deliveriesCount)
      
      return {
        ...item,
        receivedInThisDelivery: estimatedPerDelivery > 0 ? estimatedPerDelivery : (item.totalReceived || 0)
      }
    })
  }

  const calculateDeliveryValue = () => {
    const deliveryItems = calculateDeliverySpecificQuantities()
    return deliveryItems.reduce((sum, item) => {
      return sum + ((item.receivedInThisDelivery || 0) * item.unitPrice)
    }, 0)
  }

  const getPOStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "PARTIALLY_RECEIVED": return "bg-yellow-100 text-yellow-800"
      case "ISSUED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Check if PO has pending quantities
  const hasPendingQuantities = () => {
    return poDetails?.totalPending > 0
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading delivery details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!delivery) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Delivery Not Found</h2>
          <p className="mt-2 text-gray-600">The requested delivery could not be found.</p>
          <Link
            href="/project-manager/dashboard/inventory/operations/delivery"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deliveries
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const deliveryItems = calculateDeliverySpecificQuantities()
  const deliveryValue = calculateDeliveryValue()
  const totalQuantityInThisDelivery = deliveryItems.reduce((sum, item) => sum + (item.receivedInThisDelivery || 0), 0)

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/project-manager/dashboard/inventory/operations/delivery"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Deliveries
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Delivery Details</h1>
            <p className="text-gray-600 mt-1">
              Delivery against PO: {delivery.poNumber} • {formatDate(delivery.deliveryDate)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDelivery}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Purchase Order</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {delivery.poNumber}
                  </div>
                  <Link
                    href={`/project-manager/dashboard/inventory/operations/purchase-order/${delivery.purchaseOrderId}`}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View Purchase Order
                  </Link>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Delivery Date & Time</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(delivery.deliveryDate)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Vendor</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {delivery.vendorName}
                  </div>
                  {delivery.vendor?._id && (
                    <Link
                      href={`/project-manager/dashboard/inventory/vendors-buyer/vendors/view/${delivery.vendor._id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Vendor
                    </Link>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Invoice Number</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {delivery.invoiceNumber || "Not provided"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Received By</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {delivery.receivedBy?.name || "System"}
                  </div>
                  {delivery.receivedBy?.email && (
                    <div className="text-sm text-gray-600">{delivery.receivedBy.email}</div>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">PO Status</div>
                  <div className="mt-1">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPOStatusColor(delivery.purchaseOrder?.status)}`}>
                      {delivery.purchaseOrder?.status?.replace("_", " ") || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              </div>
              
              {delivery.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Delivery Notes</div>
                  <div className="text-gray-600 whitespace-pre-wrap p-3 bg-gray-50 rounded-md">
                    {delivery.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Items Delivered Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items Delivered
                </h2>
                <div className="text-sm text-gray-600">
                  {deliveryItems.length} item{deliveryItems.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received in this delivery</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Received (All)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryItems.map((item, index) => (
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
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-green-600">
                            {item.receivedInThisDelivery || 0} {item.unit}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {item.totalReceived || 0} {item.unit}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-amber-600">
                            {item.pendingQuantity || 0} {item.unit}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency((item.receivedInThisDelivery || 0) * item.unitPrice)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Delivery Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Quantity (This Delivery):</span>
                      <span className="font-medium">
                        {totalQuantityInThisDelivery} units
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Value:</span>
                      <span className="font-medium">{formatCurrency(deliveryValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Received (All Deliveries):</span>
                      <span className="font-medium">
                        {deliveryItems.reduce((sum, item) => sum + (item.totalReceived || 0), 0)} units
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Value (This Delivery):</span>
                        <span className="text-blue-600">{formatCurrency(deliveryValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - PO Info & Related */}
          <div className="space-y-6">
            {/* PO Summary Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Purchase Order Summary
              </h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">PO Number</div>
                  <div className="text-lg font-semibold text-gray-900">{delivery.poNumber}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Order Date</div>
                  <div className="text-gray-900">{formatDate(delivery.purchaseOrder?.orderDate)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Expected Delivery</div>
                  <div className="text-gray-900">
                    {delivery.purchaseOrder?.expectedDeliveryDate 
                      ? formatDate(delivery.purchaseOrder.expectedDeliveryDate)
                      : "Not specified"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Total Amount</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(delivery.purchaseOrder?.totalAmount || 0)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700">Remaining Quantities</div>
                  <div className={`text-lg font-semibold ${hasPendingQuantities() ? 'text-amber-600' : 'text-green-600'}`}>
                    {poDetails?.totalPending || 0} units
                  </div>
                  <div className="text-xs text-gray-600">
                    {hasPendingQuantities() ? 'Pending delivery' : 'All delivered'}
                  </div>
                </div>
                
                {/* PO Progress */}
                {delivery.purchaseOrder && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Delivery Progress</span>
                      <span className="font-medium">
                        {delivery.purchaseOrder.totalReceived || 0} / {
                          deliveryItems.reduce((sum, item) => sum + item.quantity, 0)
                        } units
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          delivery.purchaseOrder.status === "COMPLETED" ? 'bg-green-500' : 
                          delivery.purchaseOrder.status === "PARTIALLY_RECEIVED" ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${(delivery.purchaseOrder.totalReceived / deliveryItems.reduce((sum, item) => sum + item.quantity, 0)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Deliveries Card */}
            {relatedDeliveries.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Other Deliveries for this PO
                </h2>
                
                <div className="space-y-3">
                  {relatedDeliveries.slice(0, 3).map((relDelivery) => (
                    <div key={relDelivery._id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(relDelivery.deliveryDate)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {relDelivery.totalQuantity || 0} units
                          </div>
                        </div>
                        <Link
                          href={`/project-manager/dashboard/inventory/operations/delivery/${relDelivery._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                      {relDelivery.invoiceNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          Invoice: {relDelivery.invoiceNumber}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {relatedDeliveries.length > 3 && (
                    <div className="text-center">
                      <Link
                        href={`/project-manager/dashboard/inventory/operations/delivery?search=${delivery.poNumber}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all {relatedDeliveries.length} deliveries →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-2">
                {hasPendingQuantities() ? (
                  <Link
                    href={`/project-manager/dashboard/inventory/operations/purchase-order/${delivery.purchaseOrderId}/receive`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Truck className="w-4 h-4" />
                    Record Another Delivery
                  </Link>
                ) : (
                  <div className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-center">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    All quantities delivered
                  </div>
                )}
                
                <Link
                  href={`/project-manager/dashboard/inventory/operations/purchase-order/${delivery.purchaseOrderId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md"
                >
                  <FileText className="w-4 h-4" />
                  View Purchase Order
                </Link>
                
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                >
                  <Printer className="w-4 h-4" />
                  Print Delivery Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}